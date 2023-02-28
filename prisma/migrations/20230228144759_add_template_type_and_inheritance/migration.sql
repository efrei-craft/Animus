-- CreateEnum
CREATE TYPE "ServerType" AS ENUM ('VELOCITY', 'PAPER');

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "autoremove" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "templateName" TEXT,
ADD COLUMN     "type" "ServerType" NOT NULL DEFAULT 'PAPER';

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_templateName_fkey" FOREIGN KEY ("templateName") REFERENCES "Template"("name") ON DELETE SET NULL ON UPDATE CASCADE;
