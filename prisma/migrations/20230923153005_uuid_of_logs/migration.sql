/*
  Warnings:

  - The primary key for the `Log` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Log" DROP CONSTRAINT "Log_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Log_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Log_id_seq";
