-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_templateName_fkey";

-- CreateTable
CREATE TABLE "_GameToTemplate" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GameToTemplate_AB_unique" ON "_GameToTemplate"("A", "B");

-- CreateIndex
CREATE INDEX "_GameToTemplate_B_index" ON "_GameToTemplate"("B");

-- AddForeignKey
ALTER TABLE "_GameToTemplate" ADD CONSTRAINT "_GameToTemplate_A_fkey" FOREIGN KEY ("A") REFERENCES "Game"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GameToTemplate" ADD CONSTRAINT "_GameToTemplate_B_fkey" FOREIGN KEY ("B") REFERENCES "Template"("name") ON DELETE CASCADE ON UPDATE CASCADE;
