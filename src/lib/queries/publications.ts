import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

// Read layer for publications. Server Components read through these (never
// inline Prisma in pages) so caching + the published-only rule stay uniform.
// Wrapped in React cache() for per-request memoization.

export const getPublications = cache(async () => {
  return db.publication.findMany({
    where: { published: true },
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

/** Published slugs, for generateStaticParams. */
export const getPublicationSlugs = cache(async () => {
  const rows = await db.publication.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, title: true },
  });
  return rows;
});
