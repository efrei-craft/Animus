/*
  Warnings:

  - You are about to drop the column `template` on the `Game` table. All the data in the column will be lost.
  - The primary key for the `GameServer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `GameServer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `GameServer` table. All the data in the column will be lost.
  - You are about to drop the column `lastHeartbeat` on the `GameServer` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `GameServer` table. All the data in the column will be lost.
  - You are about to drop the column `permanent` on the `GameServer` table. All the data in the column will be lost.
  - You are about to drop the column `ready` on the `GameServer` table. All the data in the column will be lost.
  - You are about to drop the column `template` on the `GameServer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `GameServer` table. All the data in the column will be lost.
  - You are about to drop the column `gameServerName` on the `Player` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serverName]` on the table `GameServer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `permissionToPlay` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `templateName` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serverName` to the `GameServer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ApiScope" ADD VALUE 'CHAT';

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_gameServerName_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "template",
ADD COLUMN     "permissionToPlay" TEXT NOT NULL,
ADD COLUMN     "templateName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GameServer" DROP CONSTRAINT "GameServer_pkey",
DROP COLUMN "address",
DROP COLUMN "createdAt",
DROP COLUMN "lastHeartbeat",
DROP COLUMN "name",
DROP COLUMN "permanent",
DROP COLUMN "ready",
DROP COLUMN "template",
DROP COLUMN "updatedAt",
ADD COLUMN     "serverName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "gameServerName",
ADD COLUMN     "serverName" TEXT;

-- DropEnum
DROP TYPE "Template";

-- CreateTable
CREATE TABLE "Template" (
    "name" TEXT NOT NULL,
    "repository" TEXT NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Server" (
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 16,
    "permissionToJoin" TEXT NOT NULL,
    "ready" BOOLEAN NOT NULL DEFAULT false,
    "permanent" BOOLEAN NOT NULL DEFAULT false,
    "lastHeartbeat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "templateName" TEXT NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameServer_serverName_key" ON "GameServer"("serverName");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_serverName_fkey" FOREIGN KEY ("serverName") REFERENCES "Server"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_templateName_fkey" FOREIGN KEY ("templateName") REFERENCES "Template"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Server" ADD CONSTRAINT "Server_templateName_fkey" FOREIGN KEY ("templateName") REFERENCES "Template"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameServer" ADD CONSTRAINT "GameServer_serverName_fkey" FOREIGN KEY ("serverName") REFERENCES "Server"("name") ON DELETE CASCADE ON UPDATE CASCADE;
