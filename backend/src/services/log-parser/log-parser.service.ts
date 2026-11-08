import {
  ParseLogRequest,
  parseLog,
  ParseLogResponse,
} from "../../lib/nocta-ai.client.js";

export async function aiParseLogService(request: ParseLogRequest) {
  const response = await parseLog(request);
  return response as ParseLogResponse;
}
