"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSignedUploadUrl, deleteObject } from "@/lib/gcs";
import { mediaSchema, uploadUrlSchema, type MediaInput } from "@/lib/validation/schemas";
import { requireAdmin } from "@/lib/actions/_shared";

/** Mint a V4 signed upload URL (admin only). */
export async function getUploadUrl(input: { contentType: string; ext: string; folder?: string }) {
  await requireAdmin();
  const parsed = uploadUrlSchema.parse(input);
  return createSignedUploadUrl(parsed);
}

/** Persist a Media row after the browser PUTs the file to the signed URL. */
export async function createMedia(input: MediaInput) {
  await requireAdmin();
  const parsed = mediaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid media metadata" };
  }
  const media = await db.media.create({ data: parsed.data });
  revalidatePath("/admin/media");
  return { ok: true as const, media };
}

export async function updateAlt(id: string, alt: string) {
  await requireAdmin();
  await db.media.update({ where: { id }, data: { alt: alt.trim() || null } });
  revalidatePath("/admin/media");
}

/** Delete a Media object + row, blocking if it's still referenced. */
export async function deleteMedia(id: string) {
  await requireAdmin();
  const media = await db.media.findUnique({
    where: { id },
    include: { _count: { select: { coverFor: true, pdfFor: true, plateImages: true, pressFiles: true } } },
  });
  if (!media) return { ok: false as const, error: "Not found" };

  const { coverFor, pdfFor, plateImages, pressFiles } = media._count;
  const refs = coverFor + pdfFor + plateImages + pressFiles;
  if (refs > 0) {
    const where = [
      coverFor && `${coverFor} cover${coverFor > 1 ? "s" : ""}`,
      pdfFor && `${pdfFor} publication PDF${pdfFor > 1 ? "s" : ""}`,
      plateImages && `${plateImages} plate${plateImages > 1 ? "s" : ""}`,
      pressFiles && `${pressFiles} press item${pressFiles > 1 ? "s" : ""}`,
    ]
      .filter(Boolean)
      .join(", ");
    return { ok: false as const, error: `Still used by ${where}. Remove those references first.` };
  }

  try {
    await deleteObject(media.key);
  } catch {
    // Object may already be gone or GCS unconfigured locally — proceed to drop the row.
  }
  await db.media.delete({ where: { id } });
  revalidatePath("/admin/media");
  return { ok: true as const };
}
