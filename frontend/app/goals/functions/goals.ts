import { deadlineToIso, isoToDeadlineInput } from "@/lib/dates";
import { supabase } from "@/lib/supabase";

import type { GoalDraft, GoalStatus } from "../content";

/** Build absolute API URL from NEXT_PUBLIC_API_URL. */
function apiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  return `${base.replace(/\/$/, "")}${path}`;
}

// what one goal looks like coming from the API
type GoalApiRow = {
  id: string;
  name: string;
  weight: number;
  deadline: string | null;
  nextAction: string;
  status: GoalStatus;
};

// turn API goal into the shape the form/list uses
function toGoalDraft(row: GoalApiRow): GoalDraft {
  return {
    id: row.id,
    name: row.name,
    weight: row.weight,
    deadline: isoToDeadlineInput(row.deadline), // long ISO date → YYYY-MM-DD
    nextAction: row.nextAction,
    status: row.status,
  };
}

/** Return the signed-in Supabase user id. */
export async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user?.id) throw new Error("Not signed in");
  return data.user.id;
}

/** Fetch goals for a user (default: active only). */
export async function listGoals(
  userId: string,
  status: GoalStatus = "active",
): Promise<GoalDraft[]> {
  const res = await fetch(
    apiUrl(`/api/goals?userId=${encodeURIComponent(userId)}&status=${status}`),
  );
  if (!res.ok) throw new Error("Failed to list goals");
  const json = (await res.json()) as { data: GoalApiRow[] };
  return json.data.map(toGoalDraft); // convert every row before giving to the page
}

/** Active + archived for the Goals desk (Show archived filters on the page). */
export async function listAllGoals(userId: string): Promise<GoalDraft[]> {
  const [active, archived] = await Promise.all([
    listGoals(userId, "active"),
    listGoals(userId, "archived"),
  ]);
  return [...active, ...archived];
}

/** Archive one goal via PATCH /api/goals/:id/archive. */
export async function archiveGoal(goalId: string) {
  const res = await fetch(
    apiUrl(`/api/goals/${encodeURIComponent(goalId)}/archive`),
    { method: "PATCH" },
  );
  if (!res.ok) throw new Error("Failed to archive goal");
  return res.json();
}

/** Set a goal back to active via PATCH /api/goals/:id. */
export async function unarchiveGoal(goalId: string) {
  const res = await fetch(apiUrl(`/api/goals/${encodeURIComponent(goalId)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "active" }),
  });
  if (!res.ok) throw new Error("Failed to activate goal");
  return res.json();
}

/** Create one goal via POST /api/goals. */
export async function createGoal(userId: string, draft: GoalDraft) {
  const res = await fetch(apiUrl("/api/goals"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      name: draft.name.trim(),
      weight: draft.weight,
      deadline: deadlineToIso(draft.deadline),
      nextAction: draft.nextAction.trim(),
      status: "active",
    }),
  });
  if (!res.ok) throw new Error("Failed to create goal");
  return res.json();
}

/** Update one goal via PATCH /api/goals/:id. */
export async function updateGoal(goalId: string, goalDraft: GoalDraft) {
  const res = await fetch(apiUrl(`/api/goals/${encodeURIComponent(goalId)}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: goalDraft.name.trim(),
      weight: goalDraft.weight,
      deadline: deadlineToIso(goalDraft.deadline),
      nextAction: goalDraft.nextAction.trim(),
      status: goalDraft.status,
    }),
  });
  if (!res.ok) throw new Error("Failed to update goal");
  return res.json();
}

/** True when the user has zero active goals (show onboarding). */
export async function shouldEnterGoalsOnboarding(userId: string) {
  const goals = await listGoals(userId);
  return goals.length === 0;
}
