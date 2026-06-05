-- CreateEnum
CREATE TYPE "GalleryLayout" AS ENUM ('Grid', 'List');

-- AlterTable
ALTER TABLE "PressItem" ADD COLUMN     "galleryLayout" "GalleryLayout" NOT NULL DEFAULT 'Grid';

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "galleryLayout" "GalleryLayout" NOT NULL DEFAULT 'Grid';
