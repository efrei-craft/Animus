/*
  Warnings:

  - Added the required column `nickname` to the `AdminAccess` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AdminAccess_name_key";

-- AlterTable
ALTER TABLE "AdminAccess" ADD COLUMN     "groups" TEXT[],
ADD COLUMN     "nickname" TEXT NOT NULL;
