"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize";
import { pressSchema } from "@/lib/validation/schemas";
import {
  type ActionState,
  requireAdmin,
  fieldErrorsFrom,
  str,
  optStr,
  reqInt,
  bool,
} from "@/lib/actions/_shared";

function revalidatePress(slug?: string) {
  revalidatePath("/press");
  if (slug) revalidatePath(`/press/${slug}`);
}

function readPress(formData: FormData) {
  return {
    slug: str(formData.get("slug")),
    outlet: str(formData.get("outlet")),
    title: str(formData.get("title")),
    subtitle: optStr(formData.get("subtitle")),
    year: reqInt(formData.get("year")),
    body: sanitizeHtml(str(formData.get("body"))),
    coverImageId: optStr(formData.get("coverImageId")),
    pdfId: optStr(formData.get("pdfId")),
    externalUrl: optStr(formData.get("externalUrl")),
    published: bool(formData.get("published")),
  };
}

export async function createPress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = pressSchema.safeParse(readPress(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  const last = await db.pressItem.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  let created: { id: string };
  try {
    created = await db.pressItem.create({
      data: { ...parsed.data, sortOrder: (last?.sortOrder ?? -1) + 1 },
      select: { id: true },
    });
  } catch (e) {
    if (isUniqueSlug(e)) return { ok: false, fieldErrors: { slug: ["Slug already in use"] } };
    throw e;
  }
  revalidatePress(parsed.data.slug);
  // Land on the edit screen so the gallery can be added straight away.
  redirect(`/admin/press/${created.id}`);
}

export async function updatePress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData.get("id"));
  if (!id) return { ok: false, error: "Missing id" };

  const parsed = pressSchema.safeParse(readPress(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  const before = await db.pressItem.findUnique({ where: { id }, select: { slug: true } });
  try {
    await db.pressItem.update({ where: { id }, data: parsed.data });
  } catch (e) {
    if (isUniqueSlug(e)) return { ok: false, fieldErrors: { slug: ["Slug already in use"] } };
    throw e;
  }
  revalidatePress(parsed.data.slug);
  if (before && before.slug !== parsed.data.slug) revalidatePath(`/press/${before.slug}`);
  return { ok: true };
}

export async function deletePress(id: string) {
  await requireAdmin();
  const item = await db.pressItem.delete({ where: { id }, select: { slug: true } });
  revalidatePress(item.slug);
  redirect("/admin/press");
}

export async function setPressPublished(id: string, value: boolean) {
  await requireAdmin();
  const item = await db.pressItem.update({ where: { id }, data: { published: value }, select: { slug: true } });
  revalidatePress(item.slug);
}

export async function reorderPress(ids: string[]) {
  await requireAdmin();
  await db.$transaction(ids.map((id, i) => db.pressItem.update({ where: { id }, data: { sortOrder: i } })));
  revalidatePress();
}

function isUniqueSlug(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: string }).code === "P2002"
  );
}
