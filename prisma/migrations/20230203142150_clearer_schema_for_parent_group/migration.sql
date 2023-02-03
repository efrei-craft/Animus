/*
  Warnings:

  - You are about to drop the column `permGroupId` on the `PermGroup` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PermGroup" DROP CONSTRAINT "PermGroup_permGroupId_fkey";

-- AlterTable
ALTER TABLE "PermGroup" DROP COLUMN "permGroupId",
ADD COLUMN     "parentGroupId" INTEGER;

-- AddForeignKey
ALTER TABLE "PermGroup" ADD CONSTRAINT "PermGroup_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "PermGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
