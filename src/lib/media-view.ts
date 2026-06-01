import type { Media } from "@/generated/prisma/client";
import type { MediaView } from "@/components/admin/MediaUploader";

/** Project a Media row to the serializable shape admin client components expect. */
export const toMediaView = (m: Media): MediaView => ({
  id: m.id,
  url: m.url,
  alt: m.alt,
  mimeType: m.mimeType,
  width: m.width,
  height: m.height,
  bytes: m.bytes,
});

export const toMediaViews = (rows: Media[]): MediaView[] => rows.map(toMediaView);
