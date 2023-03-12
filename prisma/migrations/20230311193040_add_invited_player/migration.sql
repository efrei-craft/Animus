-- CreateTable
CREATE TABLE "_partyInvited" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_partyInvited_AB_unique" ON "_partyInvited"("A", "B");

-- CreateIndex
CREATE INDEX "_partyInvited_B_index" ON "_partyInvited"("B");

-- AddForeignKey
ALTER TABLE "_partyInvited" ADD CONSTRAINT "_partyInvited_A_fkey" FOREIGN KEY ("A") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_partyInvited" ADD CONSTRAINT "_partyInvited_B_fkey" FOREIGN KEY ("B") REFERENCES "Player"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
