import { aiReasoningService } from "../../services/ai-reasoning/ai-reasoning.service.js";
import { Request, Response } from "express";
import { HttpError } from "../../lib/http-error.js";
import { z } from "zod";

export const ReasoningRequestSchema = z.object({
  goalName: z.string(),
  score: z.number(),
  weight: z.number().int().min(1).max(5),
  deadlineDays: z.number().int(),
  neglectedDays: z.number().int(),
});

export async function aiReasoningController(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = ReasoningRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw HttpError.badRequest(
      "INVALID_INPUT",
      "Invalid input",
      parsed.error.flatten(),
    );
  }
  const result = await aiReasoningService(parsed.data);
  res.status(200).json({
    message: "AI Reasoning extracted successfully!",
    data: result,
  });
}
