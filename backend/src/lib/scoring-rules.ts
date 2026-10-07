/**
 * Shared pieces for scoring.
 * scoring.ts will turn a goal into numbers; this file holds the shapes and blend %.
 * Full product rules live in docs/decision-model.md.
 */

/** The goal fields we are allowed to score from. */
export type ScoreableGoal = {
  id: string;
  weight: number; // how important (1–5)
  deadline: Date | null; // when it is due; null means no due date
  lastTouchedAt: Date; // last time the user worked on it
};

/**
 * The four scores for one goal (each is a number from 0 to 1).
 * scoring.ts fills these in. The total is combined separately.
 */
export type FactorBreakdown = {
  deadline: number; // how urgent the due date is (never 0; tomorrow highest, overdue next)
  neglect: number; // how long it has been ignored
  weight: number; // importance scaled to 0–1 (weight ÷ 5)
  momentum: number; // unused for now — always 0
};

/** The % of the total score that each factor gets. All four add up to 1. */
export type ScoreMix = {
  deadline: number;
  neglect: number;
  weight: number;
  momentum: number;
};

/** Result for one goal: id, final score, and the four factor scores. */
export type ScoredGoal = {
  goalId: string;
  total: number; // final score used for ranking
  factors: FactorBreakdown; // the four 0–1 scores (handy for “why this?” later)
};

/**
 * Current blend: deadline 50%, neglect 21%, weight 17%, momentum 12%.
 * Change only here if we retune — then re-check the scenarios in decision-model.md.
 */
export const MIX: ScoreMix = {
  deadline: 0.5,
  neglect: 0.21,
  weight: 0.17,
  momentum: 0.12,
};

/**
 * Combines the four 0–1 scores into one total using MIX %.
 * Neglect is first multiplied by weight so “ignored” only counts strongly
 * when the goal is also important.
 */
export function computeTotal(
  factors: FactorBreakdown,
  mix: ScoreMix = MIX,
): number {
  const neglectImportance = factors.neglect * factors.weight;
  return (
    mix.deadline * factors.deadline +
    mix.neglect * neglectImportance +
    mix.weight * factors.weight +
    mix.momentum * factors.momentum
  );
}
