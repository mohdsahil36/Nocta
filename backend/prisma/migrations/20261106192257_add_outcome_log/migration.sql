-- DropForeignKey
ALTER TABLE "OutcomeLog" DROP CONSTRAINT "OutcomeLog_planStepId_fkey";

-- AlterTable
ALTER TABLE "OutcomeLog" ALTER COLUMN "planStepId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OutcomeLog" ADD CONSTRAINT "OutcomeLog_planStepId_fkey" FOREIGN KEY ("planStepId") REFERENCES "PlanStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;
