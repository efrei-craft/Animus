/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `Statistic` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Statistic_key_key" ON "Statistic"("key");
