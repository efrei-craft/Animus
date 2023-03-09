/*
  Warnings:

  - You are about to drop the `_parentTemplates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_parentTemplates" DROP CONSTRAINT "_parentTemplates_A_fkey";

-- DropForeignKey
ALTER TABLE "_parentTemplates" DROP CONSTRAINT "_parentTemplates_B_fkey";

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "parentTemplateName" TEXT;

-- DropTable
DROP TABLE "_parentTemplates";

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_parentTemplateName_fkey" FOREIGN KEY ("parentTemplateName") REFERENCES "Template"("name") ON DELETE SET NULL ON UPDATE CASCADE;
