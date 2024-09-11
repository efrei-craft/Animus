-- CreateEnum
CREATE TYPE "StatisticType" AS ENUM ('VALUE', 'TRANSACTION');

-- AlterTable
ALTER TABLE "Template" ALTER COLUMN "motd" SET DEFAULT '                 &e&lEFREI CRAFT &8• &61.19.3
                        &bBienvenue !';

-- CreateTable
CREATE TABLE "Statistic" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "displayName" TEXT,
    "color" TEXT NOT NULL DEFAULT '&7',
    "type" "StatisticType" NOT NULL DEFAULT 'TRANSACTION',

    CONSTRAINT "Statistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStatisticTransaction" (
    "id" TEXT NOT NULL,
    "playerUuid" TEXT NOT NULL,
    "statisticId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "reason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerStatisticTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStatisticValue" (
    "id" TEXT NOT NULL,
    "playerUuid" TEXT NOT NULL,
    "statisticId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerStatisticValue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlayerStatisticTransaction" ADD CONSTRAINT "PlayerStatisticTransaction_playerUuid_fkey" FOREIGN KEY ("playerUuid") REFERENCES "Player"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStatisticTransaction" ADD CONSTRAINT "PlayerStatisticTransaction_statisticId_fkey" FOREIGN KEY ("statisticId") REFERENCES "Statistic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStatisticValue" ADD CONSTRAINT "PlayerStatisticValue_playerUuid_fkey" FOREIGN KEY ("playerUuid") REFERENCES "Player"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStatisticValue" ADD CONSTRAINT "PlayerStatisticValue_statisticId_fkey" FOREIGN KEY ("statisticId") REFERENCES "Statistic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
