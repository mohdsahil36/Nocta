import { apiUrl } from "@/app/goals/functions/goals";

/** Why this score? Four numbers the engine used (deadline, neglect, etc.). */
type ScoringFactors = {
  deadline: number;
  neglect: number;
  weight: number;
  momentum: number;
};

/** The #1 goal — what to show as “your next step” (name + action + score). */
type TopPickedGoal = {
  goalId: string;
  name: string;
  nextAction: string;
  total: number;
  factors: ScoringFactors;
};

/** One goal in the full ranking (all goals’ scores; no names from the API yet). */
type RankedGoal = {
  goalId: string;
  total: number;
  factors: ScoringFactors;
};

/** Whole answer from the API: winner + the full ranked list. */
export type CheckInResult = {
  pick: TopPickedGoal;
  ranked: RankedGoal[];
};

/** POST /api/check-in — rank goals and return the winning pick. */
export async function checkIn(
  userId: string,
  minutes: 20 | 45 | 90,
  energy: "low" | "steady" | "high",
): Promise<CheckInResult> {
  const response = await fetch(apiUrl("/api/check-in"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      minutes,
      energy,
    }),
  });
  if (!response.ok) throw new Error("Failed to check in");
  const json = (await response.json()) as { data: CheckInResult };
  return json.data;
}
