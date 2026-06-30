import "server-only";
import { db } from "@/lib/db";

// Admin reads — unfiltered (include unpublished/draft rows). No React cache()
// here: admin views should always reflect the latest writes.

export const adminListPublications = () =>
  db.publication.findMany({ orderBy: { sortOrder: "asc" }, include: { coverImage: true } });

export const adminGetPublication = (id: string) =>
  db.publication.findUnique({
    where: { id },
    include: { coverImage: true, pdf: true, gallery: { orderBy: { sortOrder: "asc" }, include: { media: true } } },
  });

export const adminListFilms = () => db.film.findMany({ orderBy: { sortOrder: "asc" } });
export const adminGetFilm = (id: string) => db.film.findUnique({ where: { id } });

export const adminListPress = () =>
  db.pressItem.findMany({ orderBy: { sortOrder: "asc" }, include: { coverImage: true } });
export const adminGetPress = (id: string) =>
  db.pressItem.findUnique({
    where: { id },
    include: { coverImage: true, pdf: true, gallery: { orderBy: { sortOrder: "asc" }, include: { media: true } } },
  });

export const adminListExhibitions = () =>
  db.exhibition.findMany({ orderBy: { sortOrder: "asc" }, include: { coverImage: true } });
export const adminGetExhibition = (id: string) =>
  db.exhibition.findUnique({
    where: { id },
    include: { coverImage: true, pdf: true, gallery: { orderBy: { sortOrder: "asc" }, include: { media: true } } },
  });

export const adminListTimeline = () => db.timelineEntry.findMany({ orderBy: { sortOrder: "asc" } });
export const adminListAffiliations = () => db.affiliation.findMany({ orderBy: { sortOrder: "asc" } });

export const adminGetSettings = () => db.siteSettings.findUnique({ where: { id: "singleton" } });

export const adminListMedia = () => db.media.findMany({ orderBy: { createdAt: "desc" } });

export async function adminDashboardCounts() {
  const publications = await db.publication.count();
  const films = await db.film.count();
  const press = await db.pressItem.count();
  const exhibitions = await db.exhibition.count();
  const timeline = await db.timelineEntry.count();
  const affiliations = await db.affiliation.count();
  const media = await db.media.count();
  return { publications, films, press, exhibitions, timeline, affiliations, media };
}
