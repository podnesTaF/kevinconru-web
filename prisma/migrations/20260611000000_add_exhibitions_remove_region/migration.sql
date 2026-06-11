-- Remove Region from Publication (filter + field dropped entirely).
ALTER TABLE "Publication" DROP COLUMN "region";
DROP TYPE "Region";

-- CreateTable: Exhibition — mirrors PressItem with `venue` as the meta line.
CREATE TABLE "Exhibition" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "year" INTEGER NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "coverImageId" TEXT,
    "pdfId" TEXT,
    "externalUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "galleryLayout" "GalleryLayout" NOT NULL DEFAULT 'Grid',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exhibition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Exhibition_slug_key" ON "Exhibition"("slug");
CREATE INDEX "Exhibition_published_sortOrder_idx" ON "Exhibition"("published", "sortOrder");

ALTER TABLE "Exhibition" ADD CONSTRAINT "Exhibition_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Exhibition" ADD CONSTRAINT "Exhibition_pdfId_fkey" FOREIGN KEY ("pdfId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Extend GalleryImage polymorphism to Exhibitions.
ALTER TABLE "GalleryImage" ADD COLUMN "exhibitionId" TEXT;
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "GalleryImage_exhibitionId_sortOrder_idx" ON "GalleryImage"("exhibitionId", "sortOrder");
