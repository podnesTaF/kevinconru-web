"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSignedUploadUrl, deleteObject } from "@/lib/gcs";
import { toMediaViews } from "@/lib/media-view";
import { mediaSchema, uploadUrlSchema, type MediaInput } from "@/lib/validation/schemas";
import { requireAdmin } from "@/lib/actions/_shared";

/** Full media library for the admin picker modal (refreshed on each open). */
export async function listMediaForPicker() {
  await requireAdmin();
  const rows = await db.media.findMany({ orderBy: { createdAt: "desc" } });
  return toMediaViews(rows);
}

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
    include: {
      _count: {
        select: {
          publicationCovers: true,
          publicationPdfs: true,
          pressCovers: true,
          pressPdfs: true,
          galleryImages: true,
        },
      },
    },
  });
  if (!media) return { ok: false as const, error: "Not found" };

  const c = media._count;
  const covers = c.publicationCovers + c.pressCovers;
  const pdfs = c.publicationPdfs + c.pressPdfs;
  const gallery = c.galleryImages;

  // Inline body references aren't FK-tracked (the image URL is embedded in the
  // sanitized rich-text HTML), so scan publication + press bodies for the URL.
  const [bodyPub, bodyPress] = await Promise.all([
    db.publication.count({ where: { body: { contains: media.url } } }),
    db.pressItem.count({ where: { body: { contains: media.url } } }),
  ]);
  const inline = bodyPub + bodyPress;

  if (covers + pdfs + gallery + inline > 0) {
    const where = [
      covers && `${covers} cover${covers > 1 ? "s" : ""}`,
      pdfs && `${pdfs} PDF attachment${pdfs > 1 ? "s" : ""}`,
      gallery && `${gallery} gallery image${gallery > 1 ? "s" : ""}`,
      inline && `${inline} inline body reference${inline > 1 ? "s" : ""}`,
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
