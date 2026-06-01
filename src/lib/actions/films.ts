"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize";
import { filmSchema } from "@/lib/validation/schemas";
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

const revalidateAbout = () => revalidatePath("/about");

/** Accept a bare YouTube id or any watch/share URL → extract the 11-char id. */
function parseYouTubeId(raw: string | null): string | null {
  if (!raw) return null;
  const m = raw.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  // Accept a bare 11-char id; otherwise reject (→ null = "coming soon") rather
  // than storing junk that would build a broken embed/thumbnail URL.
  return /^[A-Za-z0-9_-]{11}$/.test(raw) ? raw : null;
}

function readFilm(formData: FormData) {
  return {
    title: str(formData.get("title")),
    year: reqInt(formData.get("year")),
    youtubeId: parseYouTubeId(optStr(formData.get("youtubeId"))),
    startSeconds: optInt(formData.get("startSeconds")),
    intro: sanitizeHtml(str(formData.get("intro"))),
    published: bool(formData.get("published")),
  };
}

export async function createFilm(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = filmSchema.safeParse(readFilm(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
  const last = await db.film.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  await db.film.create({ data: { ...parsed.data, sortOrder: (last?.sortOrder ?? -1) + 1 } });
  revalidateAbout();
  redirect("/admin/films");
}

export async function updateFilm(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData.get("id"));
  if (!id) return { ok: false, error: "Missing id" };
  const parsed = filmSchema.safeParse(readFilm(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
  await db.film.update({ where: { id }, data: parsed.data });
  revalidateAbout();
  return { ok: true };
}

export async function deleteFilm(id: string) {
  await requireAdmin();
  await db.film.delete({ where: { id } });
  revalidateAbout();
  redirect("/admin/films");
}

export async function setFilmPublished(id: string, value: boolean) {
  await requireAdmin();
  await db.film.update({ where: { id }, data: { published: value } });
  revalidateAbout();
}

export async function reorderFilms(ids: string[]) {
  await requireAdmin();
  await db.$transaction(ids.map((id, i) => db.film.update({ where: { id }, data: { sortOrder: i } })));
  revalidateAbout();
}
