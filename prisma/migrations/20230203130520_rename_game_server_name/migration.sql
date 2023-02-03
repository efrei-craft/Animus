/*
  Warnings:

  - The primary key for the `GameServer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `serverName` on the `GameServer` table. All the data in the column will be lost.
  - You are about to drop the column `gameServerServerName` on the `Player` table. All the data in the column will be lost.
  - Added the required column `name` to the `GameServer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_gameServerServerName_fkey";

-- AlterTable
ALTER TABLE "GameServer" DROP CONSTRAINT "GameServer_pkey",
DROP COLUMN "serverName",
ADD COLUMN     "name" TEXT NOT NULL,
ADD CONSTRAINT "GameServer_pkey" PRIMARY KEY ("name");

-- AlterTable
ALTER TABLE "Player" DROP COLUMN "gameServerServerName",
ADD COLUMN     "gameServerName" TEXT;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameServerName_fkey" FOREIGN KEY ("gameServerName") REFERENCES "GameServer"("name") ON DELETE SET NULL ON UPDATE CASCADE;
