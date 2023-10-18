/*
  Warnings:

  - The values [TEMPMUTE,TEMPBAN] on the enum `PunishmentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PunishmentType_new" AS ENUM ('WARN', 'MUTE', 'BAN');
ALTER TABLE "Punishment" ALTER COLUMN "type" TYPE "PunishmentType_new" USING ("type"::text::"PunishmentType_new");
ALTER TYPE "PunishmentType" RENAME TO "PunishmentType_old";
ALTER TYPE "PunishmentType_new" RENAME TO "PunishmentType";
DROP TYPE "PunishmentType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Punishment" ADD COLUMN     "templateName" TEXT;

-- AddForeignKey
ALTER TABLE "Punishment" ADD CONSTRAINT "Punishment_templateName_fkey" FOREIGN KEY ("templateName") REFERENCES "Template"("name") ON DELETE SET NULL ON UPDATE CASCADE;
