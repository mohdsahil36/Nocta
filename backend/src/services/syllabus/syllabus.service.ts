import { generateGoalSyllabus } from "../../lib/nocta-ai.client.js";
import type {
  SyllabusRequest,
  SyllabusResponse,
} from "../../lib/nocta-ai.client.js";

export async function generateSyllabus(
  goalName: string,
  notes?: string | null,
): Promise<SyllabusResponse> {
  const request: SyllabusRequest = { goalName, notes };
  return generateGoalSyllabus(request);
}
