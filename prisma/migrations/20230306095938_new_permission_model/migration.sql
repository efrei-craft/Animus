/*
  Warnings:

  - The primary key for the `Permission` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `serverType` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the `_groupHasPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_playerHasPermission` table. If the table is not empty, all the data it contains will be lost.
  - The required column `id` was added to the `Permission` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "_groupHasPermission" DROP CONSTRAINT "_groupHasPermission_A_fkey";

-- DropForeignKey
ALTER TABLE "_groupHasPermission" DROP CONSTRAINT "_groupHasPermission_B_fkey";

-- DropForeignKey
ALTER TABLE "_playerHasPermission" DROP CONSTRAINT "_playerHasPermission_A_fkey";

-- DropForeignKey
ALTER TABLE "_playerHasPermission" DROP CONSTRAINT "_playerHasPermission_B_fkey";

-- AlterTable
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_pkey",
DROP COLUMN "serverType",
ADD COLUMN     "groupName" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "playerUuid" TEXT,
ADD COLUMN     "serverTypes" TEXT[],
ADD CONSTRAINT "Permission_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "_groupHasPermission";

-- DropTable
DROP TABLE "_playerHasPermission";

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_playerUuid_fkey" FOREIGN KEY ("playerUuid") REFERENCES "Player"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_groupName_fkey" FOREIGN KEY ("groupName") REFERENCES "PermGroup"("name") ON DELETE SET NULL ON UPDATE CASCADE;
