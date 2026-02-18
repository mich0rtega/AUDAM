/*
  Warnings:

  - A unique constraint covering the columns `[folio]` on the table `Requisition` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `destinationId` to the `Requisition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `folio` to the `Requisition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `solicitorId` to the `Requisition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `solicitorName` to the `Requisition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Requisition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sku" TEXT,
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "Requisition" ADD COLUMN     "authorizerId" TEXT,
ADD COLUMN     "destinationId" TEXT NOT NULL,
ADD COLUMN     "folio" TEXT NOT NULL,
ADD COLUMN     "solicitorId" TEXT NOT NULL,
ADD COLUMN     "solicitorName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Requisition_folio_key" ON "Requisition"("folio");

-- AddForeignKey
ALTER TABLE "Requisition" ADD CONSTRAINT "Requisition_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "CostCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requisition" ADD CONSTRAINT "Requisition_authorizerId_fkey" FOREIGN KEY ("authorizerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
