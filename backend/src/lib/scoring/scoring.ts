import {
  ScoreableGoal,
  ScoringFactorBreakdown,
  ScoredGoal,
  computeTotal,
} from "./scoring-rules.js";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Whole UTC days from `from` to `to` (negative if `to` is earlier). */
export function calendarDaysBetween(from: Date, to: Date): number {
  const fromUtc = Date.UTC(
    from.getUTCFullYear(),
    from.getUTCMonth(),
    from.getUTCDate(),
  );
  const toUtc = Date.UTC(
    to.getUTCFullYear(),
    to.getUTCMonth(),
    to.getUTCDate(),
  );
  return Math.round((toUtc - fromUtc) / MS_PER_DAY);
}

/** How urgent is the due date for us. */
export function deadlineFactor(deadline: Date | null, now: Date): number {
  if (deadline === null) return 0.05;

  const days = calendarDaysBetween(now, deadline);

  if (days <= 0) return 0.95; // overdue
  if (days === 1) return 1; // tomorrow — highest
  if (days === 2) return 0.85;
  if (days === 3) return 0.75;
  if (days <= 5) return 0.6;
  if (days <= 7) return 0.48;
  if (days <= 14) return 0.32;
  if (days <= 21) return 0.2;
  if (days <= 30) return 0.12;
  return 0.05; // 31+ days or far out — floor, never 0
}

/** How many days since this goal has been ignored. */
export function neglectFactor(lastTouchedAt: Date, now: Date): number {
  const days = calendarDaysBetween(lastTouchedAt, now);

  if (days <= 0) return 0; // touched today
  if (days === 1) return 0.15;
  if (days === 2) return 0.3;
  if (days <= 4) return 0.5;
  if (days <= 6) return 0.65;
  if (days <= 8) return 0.85;
  if (days <= 10) return 0.9;
  if (days <= 14) return 0.95;
  return 1; // more than 14 days idle
}

/**What is the ranking of this goal?*/
export function goalRanking(goal: ScoreableGoal, now: Date): number {
  const currentdeadline = deadlineFactor(goal.deadline, now);
  const currentneglect = neglectFactor(goal.lastTouchedAt, now);
  const currentweight = goal.weight / 5;
  const currentmomentum = 0;

  const currentFactorsforScoringGoal: ScoringFactorBreakdown = {
    deadline: currentdeadline,
    neglect: currentneglect,
    weight: currentweight,
    momentum: currentmomentum,
  };

  const goalRanking = computeTotal(currentFactorsforScoringGoal);
  return goalRanking;
}
