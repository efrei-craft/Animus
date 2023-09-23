/*
  Warnings:

  - You are about to drop the column `gameServerServerName` on the `Log` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_gameServerServerName_fkey";

-- AlterTable
ALTER TABLE "Log" DROP COLUMN "gameServerServerName",
ADD COLUMN     "gameServerName" TEXT;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_gameServerName_fkey" FOREIGN KEY ("gameServerName") REFERENCES "GameServer"("serverName") ON DELETE SET NULL ON UPDATE CASCADE;
