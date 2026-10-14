/*
  Warnings:

  - You are about to drop the `GoalSubPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PlanStepStatus" AS ENUM ('todo', 'doing', 'done', 'skipped');

-- DropForeignKey
ALTER TABLE "GoalSubPlan" DROP CONSTRAINT "GoalSubPlan_goalId_fkey";

-- DropTable
DROP TABLE "GoalSubPlan";

-- DropEnum
DROP TYPE "GoalSubPlanStatus";

-- CreateTable
CREATE TABLE "PlanStep" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "status" "PlanStepStatus" NOT NULL DEFAULT 'todo',
    "startedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastupdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanStep_goalId_sortOrder_key" ON "PlanStep"("goalId", "sortOrder");

-- AddForeignKey
ALTER TABLE "PlanStep" ADD CONSTRAINT "PlanStep_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
