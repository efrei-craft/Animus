-- DropForeignKey
ALTER TABLE "AdminAccess" DROP CONSTRAINT "AdminAccess_key_fkey";

-- AddForeignKey
ALTER TABLE "AdminAccess" ADD CONSTRAINT "AdminAccess_key_fkey" FOREIGN KEY ("key") REFERENCES "ApiKey"("key") ON DELETE CASCADE ON UPDATE CASCADE;
