-- CreateEnum
CREATE TYPE "ChatChannels" AS ENUM ('SERVER', 'GLOBAL', 'LOCAL', 'PARTY');

-- CreateEnum
CREATE TYPE "PunishmentType" AS ENUM ('WARN', 'TEMPMUTE', 'MUTE', 'TEMPBAN', 'BAN');

-- CreateEnum
CREATE TYPE "Template" AS ENUM ('MINI');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'STARTING', 'INGAME', 'ENDING');

-- CreateTable
CREATE TABLE "Player" (
    "uuid" TEXT NOT NULL,
    "chatChannel" "ChatChannels" NOT NULL DEFAULT 'SERVER',
    "discordUserId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "gameServerServerName" TEXT,
    "partyId" INTEGER,
    "memberOfPartyId" INTEGER,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "DiscordUser" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "discordRole" TEXT NOT NULL DEFAULT 'Visiteur',

    CONSTRAINT "DiscordUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Punishment" (
    "id" SERIAL NOT NULL,
    "type" "PunishmentType" NOT NULL,
    "reason" TEXT,
    "expires" TIMESTAMP(3),
    "playerUuid" TEXT,

    CONSTRAINT "Punishment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Unnamed group',
    "prefix" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '&7',
    "bold" BOOLEAN NOT NULL DEFAULT false,
    "playerUuid" TEXT,
    "permGroupId" INTEGER,

    CONSTRAINT "PermGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "name" TEXT NOT NULL,
    "playerUuid" TEXT,
    "permGroupId" INTEGER,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Game" (
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '&7',
    "ludosGame" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "minQueueToStart" INTEGER NOT NULL DEFAULT 1,
    "maxPlayers" INTEGER NOT NULL DEFAULT 8,
    "template" "Template" NOT NULL DEFAULT 'MINI',

    CONSTRAINT "Game_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "GameServer" (
    "serverName" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "requestedGameName" TEXT,
    "template" "Template" NOT NULL DEFAULT 'MINI',
    "address" TEXT NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'WAITING',
    "ready" BOOLEAN NOT NULL DEFAULT false,
    "permanent" BOOLEAN NOT NULL DEFAULT false,
    "lastHeartbeat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameServer_pkey" PRIMARY KEY ("serverName")
);

-- CreateTable
CREATE TABLE "Party" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Unnamed party',
    "ownerUuid" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_userHasFriends" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Party_ownerUuid_key" ON "Party"("ownerUuid");

-- CreateIndex
CREATE UNIQUE INDEX "_userHasFriends_AB_unique" ON "_userHasFriends"("A", "B");

-- CreateIndex
CREATE INDEX "_userHasFriends_B_index" ON "_userHasFriends"("B");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_discordUserId_fkey" FOREIGN KEY ("discordUserId") REFERENCES "DiscordUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameServerServerName_fkey" FOREIGN KEY ("gameServerServerName") REFERENCES "GameServer"("serverName") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_memberOfPartyId_fkey" FOREIGN KEY ("memberOfPartyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Punishment" ADD CONSTRAINT "Punishment_playerUuid_fkey" FOREIGN KEY ("playerUuid") REFERENCES "Player"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermGroup" ADD CONSTRAINT "PermGroup_permGroupId_fkey" FOREIGN KEY ("permGroupId") REFERENCES "PermGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermGroup" ADD CONSTRAINT "PermGroup_playerUuid_fkey" FOREIGN KEY ("playerUuid") REFERENCES "Player"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_playerUuid_fkey" FOREIGN KEY ("playerUuid") REFERENCES "Player"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_permGroupId_fkey" FOREIGN KEY ("permGroupId") REFERENCES "PermGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameServer" ADD CONSTRAINT "GameServer_gameName_fkey" FOREIGN KEY ("gameName") REFERENCES "Game"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameServer" ADD CONSTRAINT "GameServer_requestedGameName_fkey" FOREIGN KEY ("requestedGameName") REFERENCES "Game"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_ownerUuid_fkey" FOREIGN KEY ("ownerUuid") REFERENCES "Player"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userHasFriends" ADD CONSTRAINT "_userHasFriends_A_fkey" FOREIGN KEY ("A") REFERENCES "Player"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userHasFriends" ADD CONSTRAINT "_userHasFriends_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
