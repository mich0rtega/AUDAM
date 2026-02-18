/*
  Warnings:

  - You are about to drop the `Movement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PriceHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Requisition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequisitionItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Movement" DROP CONSTRAINT "Movement_costCenterId_fkey";

-- DropForeignKey
ALTER TABLE "Movement" DROP CONSTRAINT "Movement_environmentId_fkey";

-- DropForeignKey
ALTER TABLE "Movement" DROP CONSTRAINT "Movement_productId_fkey";

-- DropForeignKey
ALTER TABLE "Movement" DROP CONSTRAINT "Movement_requisitionId_fkey";

-- DropForeignKey
ALTER TABLE "Movement" DROP CONSTRAINT "Movement_responsibleId_fkey";

-- DropForeignKey
ALTER TABLE "Movement" DROP CONSTRAINT "Movement_typeId_fkey";

-- DropForeignKey
ALTER TABLE "PriceHistory" DROP CONSTRAINT "PriceHistory_changedBy_fkey";

-- DropForeignKey
ALTER TABLE "PriceHistory" DROP CONSTRAINT "PriceHistory_productId_fkey";

-- DropForeignKey
ALTER TABLE "Requisition" DROP CONSTRAINT "Requisition_autorizadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "Requisition" DROP CONSTRAINT "Requisition_environmentId_fkey";

-- DropForeignKey
ALTER TABLE "Requisition" DROP CONSTRAINT "Requisition_solicitanteId_fkey";

-- DropForeignKey
ALTER TABLE "Requisition" DROP CONSTRAINT "Requisition_statusId_fkey";

-- DropForeignKey
ALTER TABLE "RequisitionItem" DROP CONSTRAINT "RequisitionItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "RequisitionItem" DROP CONSTRAINT "RequisitionItem_requisitionId_fkey";

-- DropTable
DROP TABLE "Movement";

-- DropTable
DROP TABLE "PriceHistory";

-- DropTable
DROP TABLE "Requisition";

-- DropTable
DROP TABLE "RequisitionItem";
