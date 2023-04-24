/*
  Warnings:

  - You are about to drop the column `static` on the `Server` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Server" DROP COLUMN "static";

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "static" BOOLEAN NOT NULL DEFAULT false;
