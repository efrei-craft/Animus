-- DropForeignKey
ALTER TABLE "GameServer" DROP CONSTRAINT "GameServer_gameName_fkey";

-- AlterTable
ALTER TABLE "GameServer" ALTER COLUMN "gameName" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "GameServer" ADD CONSTRAINT "GameServer_gameName_fkey" FOREIGN KEY ("gameName") REFERENCES "Game"("name") ON DELETE SET NULL ON UPDATE CASCADE;
