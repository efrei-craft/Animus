/*
  Warnings:

  - The primary key for the `PermGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `PermGroup` table. All the data in the column will be lost.
  - You are about to drop the column `parentGroupId` on the `PermGroup` table. All the data in the column will be lost.
  - You are about to drop the column `permGroupId` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `playerUuid` on the `Permission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PermGroup" DROP CONSTRAINT "PermGroup_parentGroupId_fkey";

-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_permGroupId_fkey";

-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_playerUuid_fkey";

-- AlterTable
ALTER TABLE "PermGroup" DROP CONSTRAINT "PermGroup_pkey",
DROP COLUMN "id",
DROP COLUMN "parentGroupId",
ADD COLUMN     "parentGroupName" TEXT,
ADD CONSTRAINT "PermGroup_pkey" PRIMARY KEY ("name");

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "permGroupId",
DROP COLUMN "playerUuid";

-- CreateTable
CREATE TABLE "_PermGroupToPermission" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PermissionToPlayer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PermGroupToPermission_AB_unique" ON "_PermGroupToPermission"("A", "B");

-- CreateIndex
CREATE INDEX "_PermGroupToPermission_B_index" ON "_PermGroupToPermission"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToPlayer_AB_unique" ON "_PermissionToPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToPlayer_B_index" ON "_PermissionToPlayer"("B");

-- AddForeignKey
ALTER TABLE "PermGroup" ADD CONSTRAINT "PermGroup_parentGroupName_fkey" FOREIGN KEY ("parentGroupName") REFERENCES "PermGroup"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermGroupToPermission" ADD CONSTRAINT "_PermGroupToPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "PermGroup"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermGroupToPermission" ADD CONSTRAINT "_PermGroupToPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "Permission"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToPlayer" ADD CONSTRAINT "_PermissionToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToPlayer" ADD CONSTRAINT "_PermissionToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
