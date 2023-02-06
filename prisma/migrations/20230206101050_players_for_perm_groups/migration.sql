/*
  Warnings:

  - You are about to drop the column `playerUuid` on the `PermGroup` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PermGroup" DROP CONSTRAINT "PermGroup_playerUuid_fkey";

-- AlterTable
ALTER TABLE "PermGroup" DROP COLUMN "playerUuid";

-- CreateTable
CREATE TABLE "_PermGroupToPlayer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PermGroupToPlayer_AB_unique" ON "_PermGroupToPlayer"("A", "B");

-- CreateIndex
CREATE INDEX "_PermGroupToPlayer_B_index" ON "_PermGroupToPlayer"("B");

-- AddForeignKey
ALTER TABLE "_PermGroupToPlayer" ADD CONSTRAINT "_PermGroupToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "PermGroup"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermGroupToPlayer" ADD CONSTRAINT "_PermGroupToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
