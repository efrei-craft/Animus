/*
  Warnings:

  - The primary key for the `ApiKey` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ApiKey` table. All the data in the column will be lost.
  - Added the required column `key` to the `ApiKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_pkey",
DROP COLUMN "id",
ADD COLUMN     "key" TEXT NOT NULL,
ADD CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("key");
