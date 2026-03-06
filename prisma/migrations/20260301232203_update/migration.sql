-- AlterTable
ALTER TABLE "Requisition" ADD COLUMN     "almacenApproved" BOOLEAN,
ADD COLUMN     "almacenAuthAt" TIMESTAMP(3),
ADD COLUMN     "almacenAuthId" TEXT,
ADD COLUMN     "autorizadorApproved" BOOLEAN,
ADD COLUMN     "autorizadorAuthAt" TIMESTAMP(3),
ADD COLUMN     "autorizadorAuthId" TEXT;

-- AddForeignKey
ALTER TABLE "Requisition" ADD CONSTRAINT "Requisition_almacenAuthId_fkey" FOREIGN KEY ("almacenAuthId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
