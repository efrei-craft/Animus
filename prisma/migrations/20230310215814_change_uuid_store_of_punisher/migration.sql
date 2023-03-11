/*
  Warnings:

  - You are about to drop the column `playerUuid` on the `Punishment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Punishment" DROP CONSTRAINT "Punishment_playerUuid_fkey";

-- AlterTable
ALTER TABLE "Punishment" DROP COLUMN "playerUuid",
ADD COLUMN     "punisherUuid" TEXT;

-- AddForeignKey
ALTER TABLE "Punishment" ADD CONSTRAINT "Punishment_punisherUuid_fkey" FOREIGN KEY ("punisherUuid") REFERENCES "Player"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
