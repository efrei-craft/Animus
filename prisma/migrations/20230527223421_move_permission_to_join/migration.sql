/*
  Warnings:

  - You are about to drop the column `permissionToJoin` on the `Server` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Server" DROP COLUMN "permissionToJoin";

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "permissionToJoin" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "motd" SET DEFAULT '                 &e&lEFREI CRAFT &8• &61.19.3
                        &bBienvenue !';
