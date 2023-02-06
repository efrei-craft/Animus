/*
  Warnings:

  - The values [SERVERS] on the enum `ApiScope` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `material` on the `Game` table. All the data in the column will be lost.
  - Added the required column `menuMaterial` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApiScope_new" AS ENUM ('SERVER', 'PLAYERS', 'GROUPS', 'PUNISHMENTS', 'GAMES', 'GAMESERVERS', 'QUEUES', 'ALL');
ALTER TABLE "ApiKey" ALTER COLUMN "scopes" TYPE "ApiScope_new"[] USING ("scopes"::text::"ApiScope_new"[]);
ALTER TYPE "ApiScope" RENAME TO "ApiScope_old";
ALTER TYPE "ApiScope_new" RENAME TO "ApiScope";
DROP TYPE "ApiScope_old";
COMMIT;

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "material",
ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "menuDescription" TEXT NOT NULL DEFAULT 'No description',
ADD COLUMN     "menuMaterial" TEXT NOT NULL,
ADD COLUMN     "menuOrder" INTEGER NOT NULL DEFAULT 0;
