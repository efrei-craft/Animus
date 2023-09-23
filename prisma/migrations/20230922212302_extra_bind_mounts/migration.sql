-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "extraBinds" TEXT[] DEFAULT ARRAY[]::TEXT[];
