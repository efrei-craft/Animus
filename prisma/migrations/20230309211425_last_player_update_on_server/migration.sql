/*
  Warnings:

  - You are about to drop the column `lastHeartbeat` on the `Server` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Server" DROP COLUMN "lastHeartbeat",
ADD COLUMN     "lastPlayerUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
