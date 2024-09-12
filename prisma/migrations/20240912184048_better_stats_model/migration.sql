/*
  Warnings:

  - The primary key for the `Statistic` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Statistic` table. All the data in the column will be lost.
  - You are about to drop the `PlayerStatisticTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlayerStatisticValue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlayerStatisticTransaction" DROP CONSTRAINT "PlayerStatisticTransaction_playerUuid_fkey";

-- DropForeignKey
ALTER TABLE "PlayerStatisticTransaction" DROP CONSTRAINT "PlayerStatisticTransaction_statisticId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerStatisticValue" DROP CONSTRAINT "PlayerStatisticValue_playerUuid_fkey";

-- DropForeignKey
ALTER TABLE "PlayerStatisticValue" DROP CONSTRAINT "PlayerStatisticValue_statisticId_fkey";

-- DropIndex
DROP INDEX "Statistic_key_key";

-- AlterTable
ALTER TABLE "Statistic" DROP CONSTRAINT "Statistic_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Statistic_pkey" PRIMARY KEY ("key");

-- DropTable
DROP TABLE "PlayerStatisticTransaction";

-- DropTable
DROP TABLE "PlayerStatisticValue";

-- CreateTable
CREATE TABLE "PlayerStatisticRecord" (
    "id" TEXT NOT NULL,
    "playerUuid" TEXT NOT NULL,
    "statisticKey" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "reason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerStatisticRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlayerStatisticRecord" ADD CONSTRAINT "PlayerStatisticRecord_playerUuid_fkey" FOREIGN KEY ("playerUuid") REFERENCES "Player"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStatisticRecord" ADD CONSTRAINT "PlayerStatisticRecord_statisticKey_fkey" FOREIGN KEY ("statisticKey") REFERENCES "Statistic"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
