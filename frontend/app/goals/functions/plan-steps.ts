import { apiUrl } from "./goals";

export type PlanStepStatus = "todo" | "doing" | "done" | "skipped" | "archived";

export type PlanStep = {
  id: string;
  goalId: string;
  title: string;
  sortOrder: number;
  status: PlanStepStatus;
  startedAt: string | null;
  createdAt: string;
  archivedAt: string | null;
};

type PlanStepDraft = {
  title: string;
  sortOrder: number;
};

async function readPlanStep(response: Response): Promise<PlanStep> {
  const json = (await response.json()) as { data: PlanStep };
  return json.data;
}

/** Active steps for a goal via GET /api/goals/:goalId/plan (archived omitted). */
export async function listPlanSteps(goalId: string): Promise<PlanStep[]> {
  const response = await fetch(
    apiUrl(`/api/goals/${encodeURIComponent(goalId)}/plan`),
  );
  if (!response.ok) throw new Error("Failed to list plan steps");
  const json = (await response.json()) as { data: PlanStep[] };
  return json.data;
}

/** Create a step via POST /api/goals/:goalId/plan. */
export async function createPlanStep(
  goalId: string,
  draft: PlanStepDraft,
): Promise<PlanStep> {
  const response = await fetch(
    apiUrl(`/api/goals/${encodeURIComponent(goalId)}/plan`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draft.title.trim(),
        sortOrder: draft.sortOrder,
      }),
    },
  );
  if (!response.ok) throw new Error("Failed to create plan step");
  return readPlanStep(response);
}

/** Archive a step via PATCH /api/plan/:id/archive (row stays, list skips it). */
export async function archivePlanStep(stepId: string): Promise<PlanStep> {
  const response = await fetch(
    apiUrl(`/api/plan/${encodeURIComponent(stepId)}/archive`),
    { method: "PATCH" },
  );
  if (!response.ok) throw new Error("Failed to archive plan step");
  return readPlanStep(response);
}

/** Archived steps for a goal via GET /api/goals/:goalId/plan/archived. */
export async function listArchivedPlanSteps(goalId: string): Promise<PlanStep[]> {
  const response = await fetch(
    apiUrl(`/api/goals/${encodeURIComponent(goalId)}/plan/archived`),
  );
  if (!response.ok) throw new Error("Failed to list archived plan steps");
  const json = (await response.json()) as { data: PlanStep[] };
  return json.data;
}

/** Restore an archived step via PATCH /api/plan/:id/restore. */
export async function restorePlanStep(stepId: string): Promise<PlanStep> {
  const response = await fetch(
    apiUrl(`/api/plan/${encodeURIComponent(stepId)}/restore`),
    { method: "PATCH" },
  );
  if (!response.ok) throw new Error("Failed to restore plan step");
  return readPlanStep(response);
}
