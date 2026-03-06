-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_responsableId_fkey";

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "centroCosto" TEXT,
ADD COLUMN     "responsableNombre" TEXT,
ALTER COLUMN "responsableId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
