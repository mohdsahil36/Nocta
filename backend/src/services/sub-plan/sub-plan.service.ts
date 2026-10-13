import type { GoalSubPlan } from "../../generated/prisma/client.js";
import prisma from "../../lib/prisma.js";

// Insert one ordered step under a goal.
export async function addSubPlan(subplan: GoalSubPlan): Promise<GoalSubPlan> {
  // Delegate is camelCase: prisma.goalSubPlan (not goalsubplan).
  const subPlan = await prisma.goalSubPlan.create({
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
