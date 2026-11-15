import prisma from "../../lib/prisma.js";
import type {
  CreateGoalInput,
  ListGoalsQuery,
  UpdateGoalInput,
} from "../../lib/goals/goal-schema.js";
import { GoalStatus } from "../../generated/prisma/enums.js";
import { HttpError } from "../../lib/http-error.js";

/* Zod gives ISO strings; Prisma wants Date | null. */
function toDeadline(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Date(value);
}

export async function listGoals(query: ListGoalsQuery) {
  return prisma.goal.findMany({
    where: {
      userId: query.userId,
      status: query.status,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      outcomeLogs: {
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function createGoal(input: CreateGoalInput) {
  return prisma.goal.create({
    data: {
      userId: input.userId,
      name: input.name,
      weight: input.weight,
      deadline: toDeadline(input.deadline) ?? null,
      nextAction: input.nextAction,
      status: input.status,
      lastTouchedAt: new Date(),
    },
  });
}

export async function updateGoal(id: string, input: UpdateGoalInput) {
  return prisma.goal.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.weight !== undefined ? { weight: input.weight } : {}),
      ...(input.deadline !== undefined
        ? { deadline: toDeadline(input.deadline) }
        : {}),
      ...(input.nextAction !== undefined
        ? { nextAction: input.nextAction }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      lastTouchedAt: new Date(),
    },
  });
}

export async function archiveGoal(id: string) {
  return prisma.goal.update({
    where: { id },
    data: {
      status: GoalStatus.archived,
      lastTouchedAt: new Date(),
    },
  });
}

export async function deleteGoal(id: string, userId: string) {
  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) throw HttpError.notFound("GOAL_NOT_FOUND", "Goal not found");
  if (goal.userId !== userId) throw HttpError.badRequest("FORBIDDEN", "Not your goal");
  await prisma.planStep.deleteMany({ where: { goalId: id } });
  await prisma.outcomeLog.deleteMany({ where: { goalId: id } });
  return prisma.goal.delete({ where: { id } });
}
