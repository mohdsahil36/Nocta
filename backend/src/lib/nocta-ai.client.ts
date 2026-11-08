const NOCTA_AI_URL = process.env.NOCTA_AI_URL ?? "http://localhost:8000"; // base url for nocta ai server
const TIMEOUT_MS = 30000; // 30s — Groq inference can be slow on first request

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

export interface ReasoningRequest {
  goalName: string;
  score: number;
  weight: number;
  deadlineDays: number;
  neglectedDays: number;
}

export interface ReasoningResponse {
  narration: string;
}

export async function getReasoning(
  data: ReasoningRequest,
): Promise<ReasoningResponse> {
  let res: Response;

  try {
    res = await fetch(`${NOCTA_AI_URL}/ai/reasoning`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: withTimeout(TIMEOUT_MS),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ai service is unreachable";
    throw new Error(message);
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Ai service returned error: ${errorText}`);
  }

  const narration = await res.text();
  return { narration };
}
export interface ParseLogRequest {
  text: string;
  goalName: string;
}

export interface ParseLogResponse {
  outcome: "completed" | "partial" | "postponed" | "changed";
  notes: string;
  confidence: number;
}

export async function parseLog(
  data: ParseLogRequest,
): Promise<ParseLogResponse> {
  let res: Response;

  try {
    res = await fetch(`${NOCTA_AI_URL}/ai/parse-log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: withTimeout(TIMEOUT_MS),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Ai Logging service is unreachable";
    throw new Error(message);
  }
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Ai service returned error: ${errorText}`);
  }

  return res.json() as Promise<ParseLogResponse>;
}
