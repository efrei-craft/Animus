-- CreateEnum
CREATE TYPE "ApiScope" AS ENUM ('PLAYERS', 'GROUPS', 'PUNISHMENTS', 'GAMES', 'GAMESERVERS');

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "scopes" "ApiScope"[],
    "expires" TIMESTAMP(3),

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);
