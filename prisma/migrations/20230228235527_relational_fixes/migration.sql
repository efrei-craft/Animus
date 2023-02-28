/*
  Warnings:

  - You are about to drop the `_PermGroupToPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PermGroupToPlayer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PermissionToPlayer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PermGroupToPermission" DROP CONSTRAINT "_PermGroupToPermission_A_fkey";

-- DropForeignKey
ALTER TABLE "_PermGroupToPermission" DROP CONSTRAINT "_PermGroupToPermission_B_fkey";

-- DropForeignKey
ALTER TABLE "_PermGroupToPlayer" DROP CONSTRAINT "_PermGroupToPlayer_A_fkey";

-- DropForeignKey
ALTER TABLE "_PermGroupToPlayer" DROP CONSTRAINT "_PermGroupToPlayer_B_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToPlayer" DROP CONSTRAINT "_PermissionToPlayer_A_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToPlayer" DROP CONSTRAINT "_PermissionToPlayer_B_fkey";

-- DropTable
DROP TABLE "_PermGroupToPermission";

-- DropTable
DROP TABLE "_PermGroupToPlayer";

-- DropTable
DROP TABLE "_PermissionToPlayer";

-- CreateTable
CREATE TABLE "_groupHasPermission" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_playerHasGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_playerHasPermission" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_groupHasPermission_AB_unique" ON "_groupHasPermission"("A", "B");

-- CreateIndex
CREATE INDEX "_groupHasPermission_B_index" ON "_groupHasPermission"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_playerHasGroup_AB_unique" ON "_playerHasGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_playerHasGroup_B_index" ON "_playerHasGroup"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_playerHasPermission_AB_unique" ON "_playerHasPermission"("A", "B");

-- CreateIndex
CREATE INDEX "_playerHasPermission_B_index" ON "_playerHasPermission"("B");

-- AddForeignKey
ALTER TABLE "_groupHasPermission" ADD CONSTRAINT "_groupHasPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "PermGroup"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_groupHasPermission" ADD CONSTRAINT "_groupHasPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "Permission"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_playerHasGroup" ADD CONSTRAINT "_playerHasGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "PermGroup"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_playerHasGroup" ADD CONSTRAINT "_playerHasGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_playerHasPermission" ADD CONSTRAINT "_playerHasPermission_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_playerHasPermission" ADD CONSTRAINT "_playerHasPermission_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
