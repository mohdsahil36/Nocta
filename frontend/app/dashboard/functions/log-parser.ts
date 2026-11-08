import { apiUrl } from "@/app/goals/functions/goals";

export interface ParseLogRequest {
  text: string;
  goalName: string;
}

export interface ParseLogResponse {
  confidence: number;
  notes: string;
  outcome: "completed" | "partial" | "postponed" | "changed";
}

export async function parseLog(
  inputData: ParseLogRequest,
): Promise<ParseLogResponse> {
  const response = await fetch(apiUrl("/api/ai/parse-log"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputData),
  });
  if (!response.ok) {
    throw new Error("Failed to parse response!");
  }
  const json = await response.json();
  return json.data;
}
