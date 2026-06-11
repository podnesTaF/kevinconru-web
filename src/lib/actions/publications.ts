"use server";

import { db } from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize";
import { publicationSchema } from "@/lib/validation/schemas";
import { type ActionState, str, optStr, optInt, reqInt, bool } from "@/lib/actions/_shared";
import { makeWorkActions, type WorkDelegate } from "@/lib/works/actions";
import { WORKS } from "@/lib/works/config";

function readPublication(formData: FormData) {
  return {
    title: str(formData.get("title")),
    slug: str(formData.get("slug")),
    subtitle: optStr(formData.get("subtitle")),
    year: reqInt(formData.get("year")),
    pages: optInt(formData.get("pages")),
    publisher: optStr(formData.get("publisher")),
    kind: str(formData.get("kind")),
    coverBg: optStr(formData.get("coverBg")),
    coverFg: optStr(formData.get("coverFg")),
    coverImageId: optStr(formData.get("coverImageId")),
    pdfId: optStr(formData.get("pdfId")),
    externalUrl: optStr(formData.get("externalUrl")),
    featured: bool(formData.get("featured")),
    published: bool(formData.get("published")),
    galleryLayout: str(formData.get("galleryLayout")) || "Grid",
    body: sanitizeHtml(str(formData.get("body"))),
  };
}

const actions = makeWorkActions({
  config: WORKS.publication,
  model: db.publication as unknown as WorkDelegate,
  schema: publicationSchema,
  readForm: readPublication,
});

export async function createPublication(prev: ActionState, formData: FormData) {
  return actions.create(prev, formData);
}
export async function updatePublication(prev: ActionState, formData: FormData) {
  return actions.update(prev, formData);
}
export async function deletePublication(id: string) {
  return actions.remove(id);
}
export async function setPublished(id: string, value: boolean) {
  return actions.setPublished(id, value);
}
export async function setFeatured(id: string, value: boolean) {
  return actions.setFeatured(id, value);
}
export async function reorderPublications(ids: string[]) {
  return actions.reorder(ids);
}
