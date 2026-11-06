-- CreateEnum
CREATE TYPE "OutcomeType" AS ENUM ('complete', 'partial', 'changed', 'postponed', 'completed');

-- CreateTable
CREATE TABLE "OutcomeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "planStepId" TEXT NOT NULL,
    "outcome" "OutcomeType" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutcomeLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OutcomeLog" ADD CONSTRAINT "OutcomeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutcomeLog" ADD CONSTRAINT "OutcomeLog_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutcomeLog" ADD CONSTRAINT "OutcomeLog_planStepId_fkey" FOREIGN KEY ("planStepId") REFERENCES "PlanStep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
