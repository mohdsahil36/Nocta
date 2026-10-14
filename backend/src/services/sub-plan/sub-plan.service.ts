import type { PlanStep } from "../../generated/prisma/client.js";
import prisma from "../../lib/prisma.js";

// Insert one ordered step under a goal.
export async function addSubPlan(subplan: PlanStep): Promise<PlanStep> {
  // Delegate is camelCase: prisma.goalSubPlan (not goalsubplan).
  const subPlan = await prisma.planStep.create({
    data: {
      goalId: subplan.goalId, // required FK — which Goal owns this step
      title: subplan.title,
      sortOrder: subplan.sortOrder,
      status: subplan.status,
      startedAt: subplan.startedAt,
      // createdAt / lastupdatedAt come from Prisma defaults (@default / @updatedAt)
    },
  });

  return subPlan;
}

// Patch fields on an existing step (lookup by step id, not goalId).
export async function updateSubPlan(subplan: PlanStep): Promise<PlanStep> {
  const updatedSubPlan = await prisma.planStep.update({
    where: {
      id: subplan.id, // primary key of this GoalSubPlan row
    },
    data: {
      title: subplan.title,
      sortOrder: subplan.sortOrder,
      status: subplan.status,
      startedAt: subplan.startedAt,
      // lastupdatedAt is @updatedAt — Prisma bumps it automatically
    },
  });
  return updatedSubPlan;
}

// Delete a step (lookup by step id , not goal id)
export async function deleteSubPlan(subplan: PlanStep): Promise<PlanStep> {
  const deletedSubPlan = await prisma.planStep.delete({
    where: {
      id: subplan.id, // primary key of this GoalSubPlan row
    },
  });
  return deletedSubPlan;
}

// Fetch all sub goals under a goal
export async function getSubGoals(goalId: string): Promise<PlanStep[]> {
  const subGoals = await prisma.planStep.findMany({
    where: {
      id: goalId,
    },
  });
  return subGoals;
}

// Get a single sub goal by id
export async function getUniqueSubGoal(
  goalId: string,
  stepId: string,
): Promise<PlanStep | null> {
  const uniqueSubGoal = await prisma.planStep.findUnique({
    where: {
      id: stepId,
      goalId: goalId,
    },
  });
  return uniqueSubGoal;
}

/**
 * Save a new order for steps under a goal.
 * Example: stepIds = ["b", "a", "c"] means B first, then A, then C.
 */
export async function reorderSubGoals(
  goalId: string,
  stepIds: string[],
): Promise<PlanStep[]> {
  await prisma.$transaction(async (tx) => {
    // 1) Give every step a temporary number that nothing else uses.
    for (let i = 0; i < stepIds.length; i++) {
      await tx.planStep.update({
        where: { id: stepIds[i]! },
        data: { sortOrder: -1 - i }, // -1, -2, -3, ...
      });
    }

    // 2) Now set the real order from the array position.
    for (let i = 0; i < stepIds.length; i++) {
      await tx.planStep.update({
        where: { id: stepIds[i]! },
        data: { sortOrder: i }, // 0, 1, 2, ...
      });
    }
  });

  // 3) Return them sorted (read-only — like Prisma orderBy examples).
  return prisma.planStep.findMany({
    where: { goalId },
    orderBy: { sortOrder: "asc" },
  });
}
