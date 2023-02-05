/*
  Warnings:

  - The values [GAMESERVERS] on the enum `ApiScope` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApiScope_new" AS ENUM ('SERVER', 'PLAYERS', 'GROUPS', 'PUNISHMENTS', 'GAMES', 'SERVERS', 'QUEUES', 'ALL');
ALTER TABLE "ApiKey" ALTER COLUMN "scopes" TYPE "ApiScope_new"[] USING ("scopes"::text::"ApiScope_new"[]);
ALTER TYPE "ApiScope" RENAME TO "ApiScope_old";
ALTER TYPE "ApiScope_new" RENAME TO "ApiScope";
DROP TYPE "ApiScope_old";
COMMIT;

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "expires" TIMESTAMP(3);
