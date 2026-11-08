/*
  Warnings:

  - The values [complete] on the enum `OutcomeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OutcomeType_new" AS ENUM ('partial', 'changed', 'postponed', 'completed');
ALTER TABLE "OutcomeLog" ALTER COLUMN "outcome" TYPE "OutcomeType_new" USING ("outcome"::text::"OutcomeType_new");
ALTER TYPE "OutcomeType" RENAME TO "OutcomeType_old";
ALTER TYPE "OutcomeType_new" RENAME TO "OutcomeType";
DROP TYPE "public"."OutcomeType_old";
COMMIT;
