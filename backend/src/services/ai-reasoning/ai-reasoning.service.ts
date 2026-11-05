import { getReasoning, ReasoningRequest } from "../../lib/nocta-ai.client.js";

export async function aiReasoningService(request: ReasoningRequest) {
  const response = await getReasoning(request);
  return response;
}
