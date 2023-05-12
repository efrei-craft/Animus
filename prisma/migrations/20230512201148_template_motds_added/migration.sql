-- AlterEnum
ALTER TYPE "ApiScope" ADD VALUE 'TEMPLATES';

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "motd" TEXT DEFAULT '                 &e&lEFREI CRAFT &8• &61.19.3
                        &bBienvenue !';
