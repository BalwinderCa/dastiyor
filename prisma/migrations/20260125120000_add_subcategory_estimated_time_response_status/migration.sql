-- AlterTable: Add subcategory to Task
ALTER TABLE "Task" ADD COLUMN "subcategory" TEXT;

-- AlterTable: Add estimatedTime, status, and updatedAt to Response
-- SQLite doesn't support adding NOT NULL columns with defaults, so add as nullable first
ALTER TABLE "Response" ADD COLUMN "estimatedTime" TEXT;
ALTER TABLE "Response" ADD COLUMN "status" TEXT;
ALTER TABLE "Response" ADD COLUMN "updatedAt" DATETIME;

-- Update existing rows
UPDATE "Response" SET "status" = 'PENDING' WHERE "status" IS NULL;
UPDATE "Response" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
