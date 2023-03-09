/*
  Warnings:

  - The primary key for the `PermGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `parentGroupName` on the `PermGroup` table. All the data in the column will be lost.
  - You are about to drop the column `groupName` on the `Permission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `PermGroup` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `A` on the `_playerHasGroup` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "PermGroup" DROP CONSTRAINT "PermGroup_parentGroupName_fkey";

-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_groupName_fkey";

-- DropForeignKey
ALTER TABLE "_playerHasGroup" DROP CONSTRAINT "_playerHasGroup_A_fkey";

-- AlterTable
ALTER TABLE "PermGroup" DROP CONSTRAINT "PermGroup_pkey",
DROP COLUMN "parentGroupName",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "parentGroupId" INTEGER,
ADD CONSTRAINT "PermGroup_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "groupName",
ADD COLUMN     "groupId" INTEGER;

-- AlterTable
ALTER TABLE "_playerHasGroup" DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PermGroup_name_key" ON "PermGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_playerHasGroup_AB_unique" ON "_playerHasGroup"("A", "B");

-- AddForeignKey
ALTER TABLE "PermGroup" ADD CONSTRAINT "PermGroup_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "PermGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PermGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_playerHasGroup" ADD CONSTRAINT "_playerHasGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "PermGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
