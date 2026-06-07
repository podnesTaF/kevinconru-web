import type { PublicationKind, Region } from "@/generated/prisma/client";

// Display labels for the enums (the DB stores granular/code-style values).
export const REGION_LABEL: Record<Region, string> = {
  Africa: "Africa",
  Oceania: "Oceania",
  Polynesia: "Polynesia",
  Melanesia: "Melanesia",
  AfricaAndOceania: "Africa & Oceania",
  SoutheastAsia: "Southeast Asia",
};

export const KIND_LABEL: Record<PublicationKind, string> = {
  Archive: "Archive",
  Monograph: "Monograph",
  ExhibitionCatalogue: "Exhibition catalogue",
};

export const regionLabel = (r: Region) => REGION_LABEL[r];
export const kindLabel = (k: PublicationKind) => KIND_LABEL[k];

/**
 * URL slug derived from a title (films have no stored slug — their detail
 * routes resolve by slugified title, see getFilmBySlug).
 */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Region filter pills shown on the Publications index.
export const REGION_FILTERS = ["All", "Oceania", "Polynesia", "Melanesia", "Africa"] as const;
export type RegionFilterValue = (typeof REGION_FILTERS)[number];

export const isRegionFilter = (v: string | undefined): v is RegionFilterValue =>
  !!v && (REGION_FILTERS as readonly string[]).includes(v);

/**
 * Map a filter pill to the granular Region enum values it should match.
 * Mirrors the prototype rule: "Oceania" groups Polynesia + Melanesia, and the
 * combined "Africa & Oceania" region matches both the Oceania and Africa pills.
 * Returns null for "All" (no WHERE filter).
 */
export function regionsForFilter(filter: RegionFilterValue): Region[] | null {
  switch (filter) {
    case "All":
      return null;
    case "Oceania":
      return ["Oceania", "Polynesia", "Melanesia", "AfricaAndOceania"];
    case "Polynesia":
      return ["Polynesia"];
    case "Melanesia":
      return ["Melanesia"];
    case "Africa":
      return ["Africa", "AfricaAndOceania"];
  }
}
