// Config registry for the three "work" entities (Publications, Press,
// Exhibitions). They share ~80% of their structure; this is the single source
// of truth the action/query factories, nav, sitemap, admin and public pages
// read from, so adding a fourth entity is mostly a new entry here.
//
// Client-safe: no server-only imports (nav reads NAV order, etc.).

export type WorkKind = "publication" | "press" | "exhibition";

export type GalleryOwnerField = "publicationId" | "pressItemId" | "exhibitionId";

export interface WorkConfig {
  key: WorkKind;
  /** Public route base, e.g. "/publications". */
  publicBase: string;
  /** Admin route base, e.g. "/admin/publications". */
  adminBase: string;
  nounSingular: string;
  nounPlural: string;
  navLabel: string;
  /** Which GalleryImage FK column owns this entity's images. */
  galleryOwnerField: GalleryOwnerField;
  /**
   * The distinguishing meta field shown beside the year (press → outlet,
   * exhibition → venue). Undefined for publications (they show kind/year).
   */
  metaField?: "outlet" | "venue";
  /** Only publications carry a "featured on home" flag. */
  hasFeatured: boolean;
  /** Extra public paths to revalidate on write (beyond the entity's own). */
  extraRevalidate: string[];
}

export const WORKS: Record<WorkKind, WorkConfig> = {
  publication: {
    key: "publication",
    publicBase: "/publications",
    adminBase: "/admin/publications",
    nounSingular: "publication",
    nounPlural: "publications",
    navLabel: "Publications",
    galleryOwnerField: "publicationId",
    hasFeatured: true,
    extraRevalidate: [],
  },
  press: {
    key: "press",
    publicBase: "/press",
    adminBase: "/admin/press",
    nounSingular: "press item",
    nounPlural: "press",
    navLabel: "Press",
    galleryOwnerField: "pressItemId",
    metaField: "outlet",
    hasFeatured: false,
    extraRevalidate: [],
  },
  exhibition: {
    key: "exhibition",
    publicBase: "/exhibitions",
    adminBase: "/admin/exhibitions",
    nounSingular: "exhibition",
    nounPlural: "exhibitions",
    navLabel: "Exhibitions",
    galleryOwnerField: "exhibitionId",
    metaField: "venue",
    hasFeatured: false,
    extraRevalidate: [],
  },
};
