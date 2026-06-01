import "server-only";
import { db } from "@/lib/db";

// Admin reads — unfiltered (include unpublished/draft rows). No React cache()
// here: admin views should always reflect the latest writes.

export const adminListPublications = () =>
  db.publication.findMany({ orderBy: { sortOrder: "asc" }, include: { coverImage: true } });

export const adminGetPublication = (id: string) =>
  db.publication.findUnique({
    where: { id },
    include: { coverImage: true, plates: { orderBy: { sortOrder: "asc" }, include: { image: true } } },
  });

export const adminListFilms = () => db.film.findMany({ orderBy: { sortOrder: "asc" } });
export const adminGetFilm = (id: string) => db.film.findUnique({ where: { id } });

export const adminListPress = () =>
  db.pressItem.findMany({ orderBy: { sortOrder: "asc" }, include: { file: true } });
export const adminGetPress = (id: string) =>
  db.pressItem.findUnique({ where: { id }, include: { file: true } });

export const adminListTimeline = () => db.timelineEntry.findMany({ orderBy: { sortOrder: "asc" } });
export const adminListAffiliations = () => db.affiliation.findMany({ orderBy: { sortOrder: "asc" } });

export const adminGetSettings = () => db.siteSettings.findUnique({ where: { id: "singleton" } });

export const adminListMedia = () => db.media.findMany({ orderBy: { createdAt: "desc" } });

export async function adminDashboardCounts() {
  const [publications, films, press, timeline, affiliations, media] = await Promise.all([
    db.publication.count(),
    db.film.count(),
    db.pressItem.count(),
    db.timelineEntry.count(),
    db.affiliation.count(),
    db.media.count(),
  ]);
  return { publications, films, press, timeline, affiliations, media };
}
