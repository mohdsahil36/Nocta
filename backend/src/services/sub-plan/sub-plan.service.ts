import type { PlanStep } from "../../generated/prisma/client.js";
import { PlanStepStatus } from "../../generated/prisma/enums.js";
import prisma from "../../lib/prisma.js";

// Insert one ordered step under a goal.
export async function createPlanStep(step: PlanStep): Promise<PlanStep> {
  const created = await prisma.planStep.create({
    data: {
      // goalId = parent Goal; id is created by Prisma (cuid) — we never set it here
      goalId: step.goalId,
      title: step.title,
      sortOrder: step.sortOrder,
      status: step.status,
      startedAt: step.startedAt,
      // createdAt / lastupdatedAt: schema defaults — omit on create
    },
  });

  return created;
}

// Patch an existing step — keyed by step id (one row), not goalId (many rows).
export async function updatePlanStep(step: PlanStep): Promise<PlanStep> {
  const updated = await prisma.planStep.update({
    where: {
      id: step.id, // which PlanStep row to change
    },
    data: {
      title: step.title,
      sortOrder: step.sortOrder,
      status: step.status,
      startedAt: step.startedAt,
      // lastupdatedAt: @updatedAt — Prisma sets this
    },
  });
  return updated;
}

// Hide one step — status archived, row stays (not a DB delete).
export async function archivePlanStep(step: PlanStep): Promise<PlanStep> {
  const archived = await prisma.planStep.update({
    where: {
      id: step.id, // this step only
    },
    data: {
      status: PlanStepStatus.archived,
      archivedAt: new Date(),
    },
  });
  return archived;
}

// All steps for one goal — filter by goalId (FK), not id (that would be a single step).
export async function listPlanSteps(goalId: string): Promise<PlanStep[]> {
  const steps = await prisma.planStep.findMany({
    where: {
      goalId, // every PlanStep whose parent is this Goal
      status: { not: PlanStepStatus.archived }, // archived steps stay in the DB, off the list
    },
    orderBy: {
      sortOrder: "asc", // replay stored path order (0 = first)
    },
  });
  return steps;
}

// Archived steps for the goal
export async function listArchivedPlanSteps(
  goalId: string,
): Promise<PlanStep[]> {
  const archivedSteps = await prisma.planStep.findMany({
    where: {
      goalId,
      status: PlanStepStatus.archived,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
  return archivedSteps;
}

// Restore archived step
export async function restoreArchivedPlanStep(goalId: string, stepId: string) {
  const activesteps = await listPlanSteps(goalId);
  const nextSortOrder =
    activesteps.reduce((max, s) => Math.max(max, s.sortOrder), -1) + 1;
  return prisma.planStep.update({
    where: { id: stepId },
    data: {
      status: PlanStepStatus.todo,
      archivedAt: null,
      sortOrder: nextSortOrder,
    },
  });
}

// One step, scoped to a goal — stops returning a step that belongs to another goal.
export async function getPlanStep(
  goalId: string,
  stepId: string,
): Promise<PlanStep | null> {
  // findFirst: match both keys. findUnique only accepts a single unique field (id).
  const step = await prisma.planStep.findFirst({
    where: {
      id: stepId, // which step
      goalId, // must belong to this goal
    },
  });
  return step;
}

// Tonight’s plan pointer: first step under the goal that isn’t done/skipped.
export async function getNextPlanStep(
  goalId: string,
): Promise<PlanStep | null> {
  return prisma.planStep.findFirst({
    where: {
      goalId, // steps for this goal only
      status: {
        notIn: [
          PlanStepStatus.done,
          PlanStepStatus.skipped,
          PlanStepStatus.archived,
        ],
      },
    },
    orderBy: {
      sortOrder: "asc", // earliest remaining step in the path
    },
  });
}
