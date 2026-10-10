import { checkInSchema } from "../../lib/check-in/check-in-schema.js";
import type { CheckInInput } from "../../lib/check-in/check-in-schema.js";
import { rankAllGoals } from "../../lib/scoring/scoring.js";
import { HttpError } from "../../lib/http-error.js";
import prisma from "../../lib/prisma.js";
import { GoalStatus } from "../../generated/prisma/enums.js";

export async function checkInService(input: CheckInInput) {
  const { userId } = checkInSchema.parse(input);
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

  const top = rankedGoals[0]!;
  const topGoal = goalsById.get(top.goalId)!;

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

  return {
    pick: {
      goalId: top.goalId,
      name: topGoal.name,
      nextAction: topGoal.nextAction,
      total: top.total,
      factors: top.factors,
    },
    ranked,
  };
}
