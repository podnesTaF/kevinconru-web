import { z } from "zod";

// Single source of truth for entity shapes — used by Server Actions (and
// available to client forms). Inputs are pre-coerced from FormData in actions.

export const REGIONS = ["Africa", "Oceania", "Polynesia", "Melanesia", "AfricaAndOceania"] as const;
export const KINDS = ["Archive", "Monograph", "ExhibitionCatalogue"] as const;

const slug = z
  .string()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only");

export const publicationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug,
  subtitle: z.string().nullable(),
  year: z.number().int().min(0).max(3000),
  pages: z.number().int().positive().nullable(),
  publisher: z.string().nullable(),
  region: z.enum(REGIONS),
  kind: z.enum(KINDS),
  body: z.string().min(1, "Body is required"),
  coverBg: z.string().nullable(),
  coverFg: z.string().nullable(),
  coverImageId: z.string().nullable(),
  pdfId: z.string().nullable(),
  externalUrl: z.union([z.string().url("Must be a valid URL"), z.null()]),
  featured: z.boolean(),
  published: z.boolean(),
});
export type PublicationInput = z.infer<typeof publicationSchema>;

// A gallery image (grid + lightbox) carries only light meta — title + caption.
export const galleryImageSchema = z.object({
  title: z.string().nullable(),
  caption: z.string().nullable(),
  mediaId: z.string().min(1, "An image is required"),
});
export type GalleryImageInput = z.infer<typeof galleryImageSchema>;

export const filmSchema = z.object({
  title: z.string().min(1, "Title is required"),
  year: z.number().int().min(0).max(3000),
  youtubeId: z.string().nullable(),
  startSeconds: z.number().int().nonnegative().nullable(),
  intro: z.string().min(1, "Intro is required"),
  published: z.boolean(),
});
export type FilmInput = z.infer<typeof filmSchema>;

export const pressSchema = z.object({
  slug,
  outlet: z.string().min(1, "Outlet is required"),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().nullable(),
  year: z.number().int().min(0).max(3000),
  body: z.string(), // may be empty (press can be just scans / a PDF / a link)
  coverImageId: z.string().nullable(),
  pdfId: z.string().nullable(),
  externalUrl: z.union([z.string().url("Must be a valid URL"), z.null()]),
  published: z.boolean(),
});
export type PressInput = z.infer<typeof pressSchema>;

export const timelineSchema = z.object({
  year: z.string().min(1, "Year is required"),
  event: z.string().min(1, "Event is required"),
  description: z.string().min(1, "Description is required"),
});
export type TimelineInput = z.infer<typeof timelineSchema>;

export const affiliationSchema = z.object({
  role: z.string().min(1, "Role is required"),
  name: z.string().min(1, "Name is required"),
  url: z.union([z.string().url("Must be a valid URL"), z.null()]),
});
export type AffiliationInput = z.infer<typeof affiliationSchema>;

const heroStat = z.object({ num: z.string().min(1), label: z.string().min(1) });

export const aboutSchema = z.object({
  bio: z.string().min(1, "Bio is required"),
  heroStats: z.array(heroStat),
  marquee: z.array(z.string().min(1)),
});
export type AboutInput = z.infer<typeof aboutSchema>;

export const contactSchema = z.object({
  tel: z.string().min(1, "Telephone is required"),
  email: z.string().email("Must be a valid email"),
  facebook: z.union([z.string().url(), z.null()]),
  instagram: z.union([z.string().url(), z.null()]),
  city: z.string().nullable(),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const mediaSchema = z.object({
  key: z.string().min(1),
  url: z.string().min(1),
  mimeType: z.string().min(1),
  bytes: z.number().int().nonnegative(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  alt: z.string().nullable(),
});
export type MediaInput = z.infer<typeof mediaSchema>;

// Allow-list the file types the admin UI offers (images + PDF) so a signed
// upload URL can't be minted for arbitrary content (e.g. text/html) hosted on
// the public bucket.
const UPLOAD_CONTENT_TYPE = /^(?:image\/(?:jpeg|png|webp|gif|avif)|application\/pdf)$/;

export const uploadUrlSchema = z.object({
  contentType: z.string().regex(UPLOAD_CONTENT_TYPE, "Unsupported file type"),
  ext: z.string().min(1).max(8),
  folder: z.string().optional(),
});
