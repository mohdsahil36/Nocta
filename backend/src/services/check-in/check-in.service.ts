import { checkInSchema } from "../../lib/check-in/check-in-schema.js";
import type { CheckInInput } from "../../lib/check-in/check-in-schema.js";
import { rankAllGoals } from "../../lib/scoring/scoring.js";
import { HttpError } from "../../lib/http-error.js";
import prisma from "../../lib/prisma.js";
import { GoalStatus } from "../../generated/prisma/enums.js";
import { getNextPlanStep } from "../sub-plan/sub-plan.service.js";
import { goalFeasibility } from "../../lib/scoring/feasibility.js";

export async function checkInService(input: CheckInInput) {
  const { userId, minutes, energy } = checkInSchema.parse(input);
  const NOW = new Date();

  // Make sure this user exists before ranking.
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw HttpError.notFound("USER_NOT_FOUND", "User not found");
  }

  const goals = await prisma.goal.findMany({
    where: { userId, status: GoalStatus.active },
  });
  if (goals.length === 0) {
    throw HttpError.notFound(
      "NO_ACTIVE_GOALS_FOUND",
      "No active goal found for this user. Please create a goal first to continue.",
    );
  }

  const rankedGoals = rankAllGoals(goals, NOW);
  const goalsById = new Map(goals.map((g) => [g.id, g]));

  const feasibilityResult = goalFeasibility(
    rankedGoals,
    goalsById,
    minutes,
    energy,
  );

  const pickedGoalId = feasibilityResult.goalId;
  const topGoal = goalsById.get(pickedGoalId)!;
  const top = rankedGoals.find((r) => r.goalId === pickedGoalId)!;
  // Plan step is tonight’s action; goal.nextAction is only the fallback.
  const nextStep = await getNextPlanStep(pickedGoalId);

  // deferred: recovery — intelligent gate from history/context, not a fixed week quota
  // Attach names so the desk can show “Also scored” without a second fetch.
  const ranked = rankedGoals.map((row) => {
    const goal = goalsById.get(row.goalId)!;
    return {
      goalId: row.goalId,
      name: goal.name,
      nextAction: goal.nextAction,
      total: row.total,
      factors: row.factors,
    };
  });

  const deadlineDays = topGoal.deadline
    ? Math.ceil((topGoal.deadline.getTime() - NOW.getTime()) / 86400)
    : 0;
  const neglectedDays = Math.floor(
    (NOW.getTime() - topGoal.lastTouchedAt.getTime()) / 86_400_000,
  );

  return {
    pick: {
      goalId: top.goalId,
      name: topGoal.name,
      planStepId: nextStep?.id ?? null,
      nextAction: nextStep?.title ?? topGoal.nextAction,
      total: top.total,
      factors: top.factors,
      deadlineDays: deadlineDays,
      neglectedDays: neglectedDays,
      feasibilityNote: feasibilityResult.feasibilityNote,
    },
    ranked,
  };
}
