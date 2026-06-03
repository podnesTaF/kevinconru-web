import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

// Read layer for the remaining public content (films, press, chronology,
// affiliations, site settings). Published-only where the model has the flag.

export const getFilms = cache(async () =>
  db.film.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
);

export const getPressItems = cache(async () =>
  db.pressItem.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { coverImage: true },
  }),
);

export const getPressItemBySlug = cache(async (slug: string) =>
  db.pressItem.findFirst({
    where: { slug, published: true },
    include: {
      coverImage: true,
      pdf: true,
      gallery: { orderBy: { sortOrder: "asc" }, include: { media: true } },
    },
  }),
);

/** Published press slugs, for generateStaticParams. */
export const getPressSlugs = cache(async () =>
  db.pressItem.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, title: true },
  }),
);

export const getTimeline = cache(async () =>
  db.timelineEntry.findMany({ orderBy: { sortOrder: "asc" } }),
);

export const getAffiliations = cache(async () =>
  db.affiliation.findMany({ orderBy: { sortOrder: "asc" } }),
);

export const getSiteSettings = cache(async () =>
  db.siteSettings.findUnique({ where: { id: "singleton" } }),
);

// Typed shapes for the JSON columns on SiteSettings.
export type HeroStat = { num: string; label: string };
export type Marquee = string[];
