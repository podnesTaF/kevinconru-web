-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "pdfId" TEXT;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_pdfId_fkey" FOREIGN KEY ("pdfId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
