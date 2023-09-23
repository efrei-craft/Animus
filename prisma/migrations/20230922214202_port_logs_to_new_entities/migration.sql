-- DropForeignKey
ALTER TABLE "Log" DROP CONSTRAINT "Log_serverName_fkey";

-- AlterTable
ALTER TABLE "Log" ADD COLUMN     "gameServerServerName" TEXT,
ADD COLUMN     "playerUuid" TEXT,
ADD COLUMN     "templateName" TEXT,
ALTER COLUMN "serverName" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_serverName_fkey" FOREIGN KEY ("serverName") REFERENCES "Server"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_gameServerServerName_fkey" FOREIGN KEY ("gameServerServerName") REFERENCES "GameServer"("serverName") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_playerUuid_fkey" FOREIGN KEY ("playerUuid") REFERENCES "Player"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_templateName_fkey" FOREIGN KEY ("templateName") REFERENCES "Template"("name") ON DELETE SET NULL ON UPDATE CASCADE;
