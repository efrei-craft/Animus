-- DropForeignKey
ALTER TABLE "PlayerStatisticRecord" DROP CONSTRAINT "PlayerStatisticRecord_playerUuid_fkey";

-- DropForeignKey
ALTER TABLE "PlayerStatisticRecord" DROP CONSTRAINT "PlayerStatisticRecord_statisticKey_fkey";

-- AddForeignKey
ALTER TABLE "PlayerStatisticRecord" ADD CONSTRAINT "PlayerStatisticRecord_playerUuid_fkey" FOREIGN KEY ("playerUuid") REFERENCES "Player"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStatisticRecord" ADD CONSTRAINT "PlayerStatisticRecord_statisticKey_fkey" FOREIGN KEY ("statisticKey") REFERENCES "Statistic"("key") ON DELETE CASCADE ON UPDATE CASCADE;
