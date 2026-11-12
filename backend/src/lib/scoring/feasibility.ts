import type { ScoredGoal } from "./scoring-rules.js";
import type { Goal } from "../../generated/prisma/client.js";

type Minutes = 20 | 45 | 90;
type Energy = "low" | "steady" | "high";

type FeasibilityResult = {
  goalId: string;
  feasibilityNote: string | null;
};

export function goalFeasibility(
  rankedGoals: ScoredGoal[],
  goalsById: Map<string, Goal>,
  minutes: Minutes,
  energy: Energy,
): FeasibilityResult {
  // 90 min = full session, any energy is fine → rank #1 always fits, return early
  // 45 min + steady/high → enough capacity, no need to walk → return rank #1
  // scenario: minutes=90, energy="low" → returns goal-A (rank #1) immediately, no loop
  if (
    minutes === 90 ||
    (minutes === 45 && (energy === "high" || energy === "steady"))
  ) {
    return { goalId: rankedGoals[0]!.goalId, feasibilityNote: null };
  }

  // reaches here only when constrained: minutes=20 (any energy) or minutes=45 + low energy
  // walk goals in score order — highest score first — find first one that fits tonight
  // scenario: minutes=20, energy="low", rankedGoals=[goal-A, goal-B]
  for (const ranked of rankedGoals) {
    const goal = goalsById.get(ranked.goalId)!;

    // how many full days since this goal was last worked on
    // scenario: goal-A touched yesterday → daysSinceTouch=1 | goal-B touched 10d ago → daysSinceTouch=10
    const daysSinceTouch = Math.floor(
      (Date.now() - goal.lastTouchedAt.getTime()) / 86_400_000,
    );

    // fit check: worth doing in a short/tired session if important (weight>=4) or long-ignored (7+ days)
    // scenario: goal-A weight=2, days=1 → fails both | goal-B weight=5, days=10 → passes weight>=4
    if (goal.weight >= 4 || daysSinceTouch >= 7) {
      // is this the same goal the scorer already picked as rank #1?
      // scenario: goal-B !== goal-A → isTopGoal=false → attach note
      // if goal-A had weight=5 it would pass here → goal-A === goal-A → isTopGoal=true → no note
      const isTopGoal = ranked.goalId === rankedGoals[0]!.goalId;
      return {
        goalId: ranked.goalId,
        feasibilityNote: isTopGoal
          ? null
          : "Stepped to a fitting goal for tonight",
      };
    }
  }

  // no goal passed the fit check — return rank #1 anyway, never leave user without a pick
  return { goalId: rankedGoals[0]!.goalId, feasibilityNote: null };
}
