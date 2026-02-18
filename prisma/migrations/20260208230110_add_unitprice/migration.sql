/*
  Warnings:

  - Added the required column `unitPrice` to the `RequisitionDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RequisitionDetail" ADD COLUMN     "unitPrice" DECIMAL(10,2) NOT NULL;
