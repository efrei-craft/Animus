-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "maximumServers" INTEGER,
ADD COLUMN     "minimumServers" INTEGER NOT NULL DEFAULT 0;
