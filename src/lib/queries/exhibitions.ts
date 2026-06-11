import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

// Read layer for exhibitions — mirrors publications/press. Published-only,
// wrapped in React cache() for per-request memoization.

export const getExhibitions = cache(async () =>
  db.exhibition.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: { coverImage: true },
  }),
);

export const getExhibitionBySlug = cache(async (slug: string) =>
  db.exhibition.findFirst({
    where: { slug, published: true },
    include: {
      coverImage: true,
      pdf: true,
      gallery: { orderBy: { sortOrder: "asc" }, include: { media: true } },
    },
  }),
);

/** Published slugs, for generateStaticParams. */
export const getExhibitionSlugs = cache(async () =>
  db.exhibition.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, title: true },
  }),
);
