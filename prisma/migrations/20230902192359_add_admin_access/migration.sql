-- AlterTable
ALTER TABLE "Template" ALTER COLUMN "motd" SET DEFAULT '                 &e&lEFREI CRAFT &8• &61.19.3
                        &bBienvenue !';

-- CreateTable
CREATE TABLE "AdminAccess" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "AdminAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccess_name_key" ON "AdminAccess"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccess_email_key" ON "AdminAccess"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAccess_key_key" ON "AdminAccess"("key");

-- AddForeignKey
ALTER TABLE "AdminAccess" ADD CONSTRAINT "AdminAccess_key_fkey" FOREIGN KEY ("key") REFERENCES "ApiKey"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
