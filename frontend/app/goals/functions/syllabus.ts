import { apiUrl } from "./goals";

export interface SyllabusStep {
  title: string;
  level: "Basic" | "Intermediate" | "Advanced";
  order: number;
  resources: string[];
}

export interface SyllabusResult {
  steps: SyllabusStep[];
}

export async function generateGoalSyllabus(
  goalId: string,
): Promise<SyllabusResult> {
  const response = await fetch(
    apiUrl(`/api/goals/${encodeURIComponent(goalId)}/syllabus`),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  );
  if (!response.ok) throw new Error("Failed to generate syllabus for this goal");
  return response.json() as Promise<SyllabusResult>;
}
