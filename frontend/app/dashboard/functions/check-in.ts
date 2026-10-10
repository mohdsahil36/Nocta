import { apiUrl } from "@/app/goals/functions/goals";

/** Why this score? Four numbers the engine used (deadline, neglect, etc.). */
export type ScoringFactors = {
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

/** One goal in the full ranking (name + scores for “Also scored”). */
type RankedGoal = {
  goalId: string;
  name: string;
  nextAction: string;
  total: number;
  factors: ScoringFactors;
};

/** Whole answer from the API: winner + the full ranked list. */
export type CheckInResult = {
  pick: TopPickedGoal;
  ranked: RankedGoal[];
};

/** Last check-in kept in localStorage (survives tab close; cleared on Adjust). */
export type CheckedInSession = {
  userId: string;
  minutes: 20 | 45 | 90;
  energy: "low" | "steady" | "high";
  result: CheckInResult;
  savedAt: string; // ISO string
};

function sessionKey(userId: string) {
  return `nocta:check-in:${userId}`;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

/** True when `iso` is the same local calendar day as `now`. */
export function isSameLocalDay(iso: string, now = new Date()) {
  const saved = new Date(iso);
  if (Number.isNaN(saved.getTime())) return false;
  return (
    saved.getFullYear() === now.getFullYear() &&
    saved.getMonth() === now.getMonth() &&
    saved.getDate() === now.getDate()
  );
}

export function saveCheckInSession(session: CheckedInSession) {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(sessionKey(session.userId), JSON.stringify(session));
  } catch {
    // quota / private mode — ignore
  }
}

export function loadCheckInSession(userId: string): CheckedInSession | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(sessionKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as CheckedInSession;
  } catch {
    return null;
  }
}

export function clearCheckInSession(userId: string) {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(sessionKey(userId));
  } catch {
    // ignore
  }
}

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
