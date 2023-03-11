/*
  Warnings:

  - You are about to drop the column `discordUserId` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the `DiscordUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[memberDiscordId]` on the table `Player` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ApiScope" ADD VALUE 'MEMBERS';

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_discordUserId_fkey";

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "discordUserId",
ADD COLUMN     "memberDiscordId" TEXT;

-- DropTable
DROP TABLE "DiscordUser";

-- CreateTable
CREATE TABLE "Member" (
    "discordId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "promo" INTEGER,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("discordId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_memberDiscordId_key" ON "Player"("memberDiscordId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_memberDiscordId_fkey" FOREIGN KEY ("memberDiscordId") REFERENCES "Member"("discordId") ON DELETE SET NULL ON UPDATE CASCADE;
