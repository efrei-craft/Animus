-- CreateEnum
CREATE TYPE "StorageMode" AS ENUM ('VOLUME', 'HOST');

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "storageMode" "StorageMode" NOT NULL DEFAULT 'VOLUME';
