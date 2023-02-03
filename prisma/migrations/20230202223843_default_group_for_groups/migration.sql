/*
  Warnings:

  - Added the required column `username` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PermGroup" ADD COLUMN     "defaultGroup" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "username" TEXT NOT NULL;
