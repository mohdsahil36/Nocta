import type { PlanStep } from "../../generated/prisma/client.js";
import { PlanStepStatus } from "../../generated/prisma/enums.js";
import prisma from "../../lib/prisma.js";

// Insert one ordered step under a goal.
export async function addSubPlan(subplan: PlanStep): Promise<PlanStep> {
  const subPlan = await prisma.planStep.create({
    data: {
      // goalId = parent Goal; id is created by Prisma (cuid) — we never set it here
      goalId: subplan.goalId,
      title: subplan.title,
      sortOrder: subplan.sortOrder,
      status: subplan.status,
      startedAt: subplan.startedAt,
      // createdAt / lastupdatedAt: schema defaults — omit on create
    },
  });

  return subPlan;
}

// Patch an existing step — keyed by step id (one row), not goalId (many rows).
export async function updateSubPlan(subplan: PlanStep): Promise<PlanStep> {
  const updatedSubPlan = await prisma.planStep.update({
    where: {
      id: subplan.id, // which PlanStep row to change
    },
    data: {
      title: subplan.title,
      sortOrder: subplan.sortOrder,
      status: subplan.status,
      startedAt: subplan.startedAt,
      // lastupdatedAt: @updatedAt — Prisma sets this
    },
  });
  return updatedSubPlan;
}

// Delete one step — keyed by step id so we don’t wipe every step under the goal.
export async function deleteSubPlan(subplan: PlanStep): Promise<PlanStep> {
  const deletedSubPlan = await prisma.planStep.delete({
    where: {
      id: subplan.id, // this step only
    },
  });
  return deletedSubPlan;
}

// All steps for one goal — filter by goalId (FK), not id (that would be a single step).
export async function getSubGoals(goalId: string): Promise<PlanStep[]> {
  const subGoals = await prisma.planStep.findMany({
    where: {
      goalId, // every PlanStep whose parent is this Goal
    },
    orderBy: {
      sortOrder: "asc", // replay stored path order (0 = first)
    },
  });
  return subGoals;
}

// One step, scoped to a goal — stops returning a step that belongs to another goal.
export async function getUniqueSubGoal(
  goalId: string,
  stepId: string,
): Promise<PlanStep | null> {
  // findFirst: match both keys. findUnique only accepts a single unique field (id).
  const uniqueSubGoal = await prisma.planStep.findFirst({
    where: {
      id: stepId, // which step
      goalId, // must belong to this goal
    },
  });
  return uniqueSubGoal;
}

// Tonight’s plan pointer: first step under the goal that isn’t done/skipped.
export async function getCurrentNextStep(
  goalId: string,
): Promise<PlanStep | null> {
  return prisma.planStep.findFirst({
    where: {
      goalId, // steps for this goal only
      status: {
        notIn: [PlanStepStatus.done, PlanStepStatus.skipped],
      },
    },
    orderBy: {
      sortOrder: "asc", // earliest remaining step in the path
    },
  });
}
