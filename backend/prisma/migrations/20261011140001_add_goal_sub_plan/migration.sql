-- CreateEnum
CREATE TYPE "GoalSubPlanStatus" AS ENUM ('todo', 'doing', 'done', 'skipped');

-- CreateTable
CREATE TABLE "GoalSubPlan" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "status" "GoalSubPlanStatus" NOT NULL DEFAULT 'todo',
    "startedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastupdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalSubPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GoalSubPlan" ADD CONSTRAINT "GoalSubPlan_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
