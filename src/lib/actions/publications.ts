"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize";
import { publicationSchema } from "@/lib/validation/schemas";
import {
  type ActionState,
  requireAdmin,
  fieldErrorsFrom,
  str,
  optStr,
  optInt,
  reqInt,
  bool,
} from "@/lib/actions/_shared";

function revalidatePublic(slug?: string) {
  revalidatePath("/");
  revalidatePath("/publications");
  if (slug) revalidatePath(`/publications/${slug}`);
}

function readPublication(formData: FormData) {
  return {
    title: str(formData.get("title")),
    slug: str(formData.get("slug")),
    subtitle: optStr(formData.get("subtitle")),
    year: reqInt(formData.get("year")),
    pages: optInt(formData.get("pages")),
    publisher: optStr(formData.get("publisher")),
    region: str(formData.get("region")),
    kind: str(formData.get("kind")),
    coverBg: optStr(formData.get("coverBg")),
    coverFg: optStr(formData.get("coverFg")),
    coverImageId: optStr(formData.get("coverImageId")),
    pdfId: optStr(formData.get("pdfId")),
    externalUrl: optStr(formData.get("externalUrl")),
    featured: bool(formData.get("featured")),
    published: bool(formData.get("published")),
    body: sanitizeHtml(str(formData.get("body"))),
  };
}

export async function createPublication(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = publicationSchema.safeParse(readPublication(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  const last = await db.publication.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  let created: { id: string };
  try {
    created = await db.publication.create({
      data: { ...parsed.data, sortOrder: (last?.sortOrder ?? -1) + 1 },
      select: { id: true },
    });
  } catch (e) {
    if (isUniqueSlug(e)) return { ok: false, fieldErrors: { slug: ["Slug already in use"] } };
    throw e;
  }
  revalidatePublic(parsed.data.slug);
  // Land on the edit screen so the gallery can be added straight away.
  redirect(`/admin/publications/${created.id}`);
}

export async function updatePublication(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData.get("id"));
  if (!id) return { ok: false, error: "Missing id" };

  const parsed = publicationSchema.safeParse(readPublication(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  const before = await db.publication.findUnique({ where: { id }, select: { slug: true } });
  try {
    await db.publication.update({ where: { id }, data: parsed.data });
  } catch (e) {
    if (isUniqueSlug(e)) return { ok: false, fieldErrors: { slug: ["Slug already in use"] } };
    throw e;
  }
  revalidatePublic(parsed.data.slug);
  if (before && before.slug !== parsed.data.slug) revalidatePath(`/publications/${before.slug}`);
  return { ok: true };
}

export async function deletePublication(id: string) {
  await requireAdmin();
  const pub = await db.publication.delete({ where: { id }, select: { slug: true } });
  revalidatePublic(pub.slug);
  redirect("/admin/publications");
}

export async function setPublished(id: string, value: boolean) {
  await requireAdmin();
  const pub = await db.publication.update({ where: { id }, data: { published: value }, select: { slug: true } });
  revalidatePublic(pub.slug);
}

export async function setFeatured(id: string, value: boolean) {
  await requireAdmin();
  await db.publication.update({ where: { id }, data: { featured: value } });
  revalidatePublic();
}

export async function reorderPublications(ids: string[]) {
  await requireAdmin();
  await db.$transaction(ids.map((id, i) => db.publication.update({ where: { id }, data: { sortOrder: i } })));
  revalidatePublic();
}

function isUniqueSlug(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: string }).code === "P2002"
  );
}
