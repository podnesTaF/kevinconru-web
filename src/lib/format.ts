import type { PublicationKind } from "@/generated/prisma/client";

// Display labels for the enums (the DB stores granular/code-style values).
export const KIND_LABEL: Record<PublicationKind, string> = {
  Archive: "Archive",
  Monograph: "Monograph",
  ExhibitionCatalogue: "Exhibition catalogue",
};

export const kindLabel = (k: PublicationKind) => KIND_LABEL[k];

/**
 * URL slug derived from a title (films have no stored slug — their detail
 * routes resolve by slugified title, see getFilmBySlug).
 */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
