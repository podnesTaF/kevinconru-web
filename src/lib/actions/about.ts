"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize";
import { aboutSchema, timelineSchema, affiliationSchema } from "@/lib/validation/schemas";
import {
  type ActionState,
  requireAdmin,
  fieldErrorsFrom,
  str,
  optStr,
} from "@/lib/actions/_shared";

const revalidateAbout = () => {
  revalidatePath("/about");
  revalidatePath("/");
};

// ── About body (bio on SiteSettings) ───────────────────────────────────────
export async function updateAbout(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = aboutSchema.safeParse({
    bio: sanitizeHtml(str(formData.get("bio"))),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: {
      id: "singleton",
      ...parsed.data,
      roleLine: "",
      heroStats: [],
      marquee: [],
      tel: "",
      telHref: "",
      email: "",
    },
  });
  revalidateAbout();
  return { ok: true };
}

// ── Chronology (TimelineEntry) ─────────────────────────────────────────────
function readTimeline(formData: FormData) {
  return {
    year: str(formData.get("year")),
    event: str(formData.get("event")),
    description: sanitizeHtml(str(formData.get("description"))),
  };
}

export async function createTimeline(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = timelineSchema.safeParse(readTimeline(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
  const last = await db.timelineEntry.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  await db.timelineEntry.create({ data: { ...parsed.data, sortOrder: (last?.sortOrder ?? -1) + 1 } });
  revalidateAbout();
  return { ok: true };
}

export async function updateTimeline(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData.get("id"));
  if (!id) return { ok: false, error: "Missing id" };
  const parsed = timelineSchema.safeParse(readTimeline(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
  await db.timelineEntry.update({ where: { id }, data: parsed.data });
  revalidateAbout();
  return { ok: true };
}

export async function deleteTimeline(id: string) {
  await requireAdmin();
  await db.timelineEntry.delete({ where: { id } });
  revalidateAbout();
}

export async function reorderTimeline(ids: string[]) {
  await requireAdmin();
  await db.$transaction(ids.map((id, i) => db.timelineEntry.update({ where: { id }, data: { sortOrder: i } })));
  revalidateAbout();
}

// ── Affiliations ───────────────────────────────────────────────────────────
function readAffiliation(formData: FormData) {
  return {
    role: str(formData.get("role")),
    name: str(formData.get("name")),
    url: optStr(formData.get("url")),
  };
}

export async function createAffiliation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = affiliationSchema.safeParse(readAffiliation(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
  const last = await db.affiliation.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  await db.affiliation.create({ data: { ...parsed.data, sortOrder: (last?.sortOrder ?? -1) + 1 } });
  revalidateAbout();
  return { ok: true };
}

export async function updateAffiliation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(formData.get("id"));
  if (!id) return { ok: false, error: "Missing id" };
  const parsed = affiliationSchema.safeParse(readAffiliation(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };
  await db.affiliation.update({ where: { id }, data: parsed.data });
  revalidateAbout();
  return { ok: true };
}

export async function deleteAffiliation(id: string) {
  await requireAdmin();
  await db.affiliation.delete({ where: { id } });
  revalidateAbout();
}

export async function reorderAffiliations(ids: string[]) {
  await requireAdmin();
  await db.$transaction(ids.map((id, i) => db.affiliation.update({ where: { id }, data: { sortOrder: i } })));
  revalidateAbout();
}
