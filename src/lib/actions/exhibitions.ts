"use server";

import { db } from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize";
import { exhibitionSchema } from "@/lib/validation/schemas";
import { type ActionState, str, optStr, reqInt, bool } from "@/lib/actions/_shared";
import { makeWorkActions, type WorkDelegate } from "@/lib/works/actions";
import { WORKS } from "@/lib/works/config";

function readExhibition(formData: FormData) {
  return {
    slug: str(formData.get("slug")),
    venue: str(formData.get("venue")),
    title: str(formData.get("title")),
    subtitle: optStr(formData.get("subtitle")),
    year: reqInt(formData.get("year")),
    body: sanitizeHtml(str(formData.get("body"))),
    coverImageId: optStr(formData.get("coverImageId")),
    pdfId: optStr(formData.get("pdfId")),
    externalUrl: optStr(formData.get("externalUrl")),
    published: bool(formData.get("published")),
    galleryLayout: str(formData.get("galleryLayout")) || "Grid",
  };
}

const actions = makeWorkActions({
  config: WORKS.exhibition,
  model: db.exhibition as unknown as WorkDelegate,
  schema: exhibitionSchema,
  readForm: readExhibition,
});

export async function createExhibition(prev: ActionState, formData: FormData) {
  return actions.create(prev, formData);
}
export async function updateExhibition(prev: ActionState, formData: FormData) {
  return actions.update(prev, formData);
}
export async function deleteExhibition(id: string) {
  return actions.remove(id);
}
export async function setExhibitionPublished(id: string, value: boolean) {
  return actions.setPublished(id, value);
}
export async function reorderExhibitions(ids: string[]) {
  return actions.reorder(ids);
}
