import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPublications } from "@/lib/queries/publications";
import { getExhibitions } from "@/lib/queries/exhibitions";
import { getFilms, getPressSlugs } from "@/lib/queries/content";
import { slugify } from "@/lib/format";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let publications: { slug: string; updatedAt: Date }[] = [];
  let exhibitions: { slug: string; updatedAt: Date }[] = [];
  let press: { slug: string }[] = [];
  let films: { title: string; youtubeId: string | null }[] = [];
  try {
    [publications, exhibitions, press, films] = await Promise.all([
      getPublications(),
      getExhibitions(),
      getPressSlugs(),
      getFilms(),
    ]);
  } catch {
    // DB unreachable at build — emit the static routes only.
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/publications`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/exhibitions`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/films`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/press`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.7 },
  ];

  const pubRoutes: MetadataRoute.Sitemap = publications.map((p) => ({
    url: `${SITE_URL}/publications/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const exhibitionRoutes: MetadataRoute.Sitemap = exhibitions.map((e) => ({
    url: `${SITE_URL}/exhibitions/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const pressRoutes: MetadataRoute.Sitemap = press.map((p) => ({
    url: `${SITE_URL}/press/${p.slug}`,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  const filmRoutes: MetadataRoute.Sitemap = films
    .filter((f) => f.youtubeId)
    .map((f) => ({
      url: `${SITE_URL}/films/${slugify(f.title)}`,
      changeFrequency: "yearly",
      priority: 0.5,
    }));

  return [...staticRoutes, ...pubRoutes, ...exhibitionRoutes, ...pressRoutes, ...filmRoutes];
}
