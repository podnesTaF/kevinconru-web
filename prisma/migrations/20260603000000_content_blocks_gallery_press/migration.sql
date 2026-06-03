-- Publication: summary -> body, add externalUrl
ALTER TABLE "Publication" RENAME COLUMN "summary" TO "body";
ALTER TABLE "Publication" ADD COLUMN "externalUrl" TEXT;

-- Plate -> GalleryImage: simplify (drop object metadata), make polymorphic,
-- rename imageId -> mediaId. Existing plates are preserved as gallery images.
ALTER TABLE "Plate" RENAME TO "GalleryImage";
ALTER TABLE "GalleryImage" RENAME CONSTRAINT "Plate_pkey" TO "GalleryImage_pkey";
ALTER TABLE "GalleryImage" RENAME COLUMN "imageId" TO "mediaId";
ALTER TABLE "GalleryImage" ALTER COLUMN "title" DROP NOT NULL;
ALTER TABLE "GalleryImage" ALTER COLUMN "publicationId" DROP NOT NULL;
ALTER TABLE "GalleryImage" ADD COLUMN "pressItemId" TEXT;
ALTER TABLE "GalleryImage" DROP COLUMN "region";
ALTER TABLE "GalleryImage" DROP COLUMN "dateText";
ALTER TABLE "GalleryImage" DROP COLUMN "materials";
ALTER TABLE "GalleryImage" DROP COLUMN "dimensions";
ALTER TABLE "GalleryImage" DROP COLUMN "provenance";

ALTER TABLE "GalleryImage" DROP CONSTRAINT "Plate_imageId_fkey";
ALTER TABLE "GalleryImage" DROP CONSTRAINT "Plate_publicationId_fkey";
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_pressItemId_fkey" FOREIGN KEY ("pressItemId") REFERENCES "PressItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER INDEX "Plate_publicationId_sortOrder_idx" RENAME TO "GalleryImage_publicationId_sortOrder_idx";
CREATE INDEX "GalleryImage_pressItemId_sortOrder_idx" ON "GalleryImage"("pressItemId", "sortOrder");

-- PressItem: rich body + cover + slug + subtitle; rename url -> externalUrl, fileId -> pdfId
ALTER TABLE "PressItem" RENAME COLUMN "url" TO "externalUrl";
ALTER TABLE "PressItem" RENAME COLUMN "fileId" TO "pdfId";
ALTER TABLE "PressItem" RENAME CONSTRAINT "PressItem_fileId_fkey" TO "PressItem_pdfId_fkey";
ALTER TABLE "PressItem" ADD COLUMN "subtitle" TEXT;
ALTER TABLE "PressItem" ADD COLUMN "body" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PressItem" ADD COLUMN "coverImageId" TEXT;
ALTER TABLE "PressItem" ADD COLUMN "slug" TEXT;
-- Backfill slug for existing rows (id is unique), then enforce NOT NULL + unique.
UPDATE "PressItem" SET "slug" = "id" WHERE "slug" IS NULL;
ALTER TABLE "PressItem" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "PressItem_slug_key" ON "PressItem"("slug");
ALTER TABLE "PressItem" ADD CONSTRAINT "PressItem_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
