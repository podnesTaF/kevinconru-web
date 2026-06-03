"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { galleryImageSchema } from "@/lib/validation/schemas";
import {
  type ActionState,
  requireAdmin,
  fieldErrorsFrom,
  str,
  optStr,
} from "@/lib/actions/_shared";

// Gallery images are polymorphic — they belong to either a Publication or a
// PressItem. These actions are shared by both admin editors.

export type GalleryOwner = { publicationId: string | null; pressItemId: string | null };

function readOwner(formData: FormData): GalleryOwner {
  return {
    publicationId: optStr(formData.get("publicationId")),
    pressItemId: optStr(formData.get("pressItemId")),
  };
}

async function revalidateOwner(owner: GalleryOwner) {
  if (owner.publicationId) {
    const pub = await db.publication.findUnique({
      where: { id: owner.publicationId },
      select: { slug: true },
    });
    revalidatePath("/");
    revalidatePath("/publications");
    if (pub) revalidatePath(`/publications/${pub.slug}`);
  } else if (owner.pressItemId) {
    const pr = await db.pressItem.findUnique({
      where: { id: owner.pressItemId },
      select: { slug: true },
    });
    revalidatePath("/press");
    if (pr) revalidatePath(`/press/${pr.slug}`);
  }
}

function readGalleryImage(formData: FormData) {
  return {
    title: optStr(formData.get("title")),
    caption: optStr(formData.get("caption")),
    mediaId: str(formData.get("mediaId")),
  };
}

export async function addGalleryImage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const owner = readOwner(formData);
  if (!owner.publicationId && !owner.pressItemId) return { ok: false, error: "Missing owner" };

  const parsed = galleryImageSchema.safeParse(readGalleryImage(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  const last = await db.galleryImage.findFirst({
    where: owner.publicationId ? { publicationId: owner.publicationId } : { pressItemId: owner.pressItemId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  await db.galleryImage.create({
    data: { ...parsed.data, ...owner, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
  await revalidateOwner(owner);
  return { ok: true };
}

export async function updateGalleryImage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData.get("id"));
  if (!id) return { ok: false, error: "Missing id" };

  const parsed = galleryImageSchema.safeParse(readGalleryImage(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  const img = await db.galleryImage.update({
    where: { id },
    data: parsed.data,
    select: { publicationId: true, pressItemId: true },
  });
  await revalidateOwner(img);
  return { ok: true };
}

export async function deleteGalleryImage(id: string) {
  await requireAdmin();
  const img = await db.galleryImage.delete({
    where: { id },
    select: { publicationId: true, pressItemId: true },
  });
  await revalidateOwner(img);
}

export async function reorderGallery(owner: GalleryOwner, ids: string[]) {
  await requireAdmin();
  await db.$transaction(ids.map((id, i) => db.galleryImage.update({ where: { id }, data: { sortOrder: i } })));
  await revalidateOwner(owner);
}
