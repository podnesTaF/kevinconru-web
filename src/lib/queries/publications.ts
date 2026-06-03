import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { regionsForFilter, type RegionFilterValue } from "@/lib/format";

// Read layer for publications. Server Components read through these (never
// inline Prisma in pages) so caching + the published-only rule stay uniform.
// Wrapped in React cache() for per-request memoization.

export const getFeaturedPublications = cache(async () => {
  return db.publication.findMany({
    where: { published: true, featured: true },
    orderBy: { sortOrder: "asc" },
    take: 3,
    include: { coverImage: true },
  });
});

export const getPublications = cache(async (filter: RegionFilterValue = "All") => {
  const regions = regionsForFilter(filter);
  return db.publication.findMany({
    where: {
      published: true,
      ...(regions ? { region: { in: regions } } : {}),
    },
    orderBy: { sortOrder: "asc" },
    include: { coverImage: true },
  });
});

export const getPublicationBySlug = cache(async (slug: string) => {
  return db.publication.findFirst({
    where: { slug, published: true },
    include: {
      coverImage: true,
      pdf: true,
      gallery: {
        orderBy: { sortOrder: "asc" },
        include: { media: true },
      },
    },
  });
});

/** Published slugs, for generateStaticParams / next-title cycling. */
export const getPublicationSlugs = cache(async () => {
  const rows = await db.publication.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, title: true },
  });
  return rows;
});
