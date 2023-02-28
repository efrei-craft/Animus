/*
  Warnings:

  - You are about to drop the column `templateName` on the `Template` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Template" DROP CONSTRAINT "Template_templateName_fkey";

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "templateName";

-- CreateTable
CREATE TABLE "_parentTemplates" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_parentTemplates_AB_unique" ON "_parentTemplates"("A", "B");

-- CreateIndex
CREATE INDEX "_parentTemplates_B_index" ON "_parentTemplates"("B");

-- AddForeignKey
ALTER TABLE "_parentTemplates" ADD CONSTRAINT "_parentTemplates_A_fkey" FOREIGN KEY ("A") REFERENCES "Template"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_parentTemplates" ADD CONSTRAINT "_parentTemplates_B_fkey" FOREIGN KEY ("B") REFERENCES "Template"("name") ON DELETE CASCADE ON UPDATE CASCADE;
