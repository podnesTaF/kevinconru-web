"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
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

// Press currently folds into About/footer on the public site.
const revalidateAbout = () => revalidatePath("/about");

function readPress(formData: FormData) {
  return {
    outlet: str(formData.get("outlet")),
    year: reqInt(formData.get("year")),
    title: str(formData.get("title")),
    url: optStr(formData.get("url")),
    fileId: optStr(formData.get("fileId")),
    published: bool(formData.get("published")),
  };
}

export async function createPress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = pressSchema.safeParse(readPress(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
  const last = await db.pressItem.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  await db.pressItem.create({ data: { ...parsed.data, sortOrder: (last?.sortOrder ?? -1) + 1 } });
  revalidateAbout();
  redirect("/admin/press");
}

export async function updatePress(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData.get("id"));
  if (!id) return { ok: false, error: "Missing id" };
  const parsed = pressSchema.safeParse(readPress(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
  await db.pressItem.update({ where: { id }, data: parsed.data });
  revalidateAbout();
  return { ok: true };
}

export async function deletePress(id: string) {
  await requireAdmin();
  await db.pressItem.delete({ where: { id } });
  revalidateAbout();
  redirect("/admin/press");
}

export async function setPressPublished(id: string, value: boolean) {
  await requireAdmin();
  await db.pressItem.update({ where: { id }, data: { published: value } });
  revalidateAbout();
}

export async function reorderPress(ids: string[]) {
  await requireAdmin();
  await db.$transaction(ids.map((id, i) => db.pressItem.update({ where: { id }, data: { sortOrder: i } })));
  revalidateAbout();
}
