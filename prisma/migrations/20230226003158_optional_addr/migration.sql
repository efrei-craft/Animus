-- AlterTable
ALTER TABLE "Server" ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "permissionToJoin" SET DEFAULT '';
