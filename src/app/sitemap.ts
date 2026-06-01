import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPublications } from "@/lib/queries/publications";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let publications: { slug: string; updatedAt: Date }[] = [];
  try {
    publications = await getPublications();
  } catch {
    // DB unreachable at build — emit the static routes only.
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/publications`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.7 },
  ];

  const pubRoutes: MetadataRoute.Sitemap = publications.map((p) => ({
    url: `${SITE_URL}/publications/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...pubRoutes];
}
