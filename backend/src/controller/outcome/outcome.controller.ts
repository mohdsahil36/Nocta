import { Request, Response } from "express";
import { HttpError } from "../../lib/http-error.js";
import { logOutcome } from "../../services/outcome/outcome.service.js";
import z from "zod";

const OutcomeSchema = z.object({
  userId: z.string(),
  goalId: z.string(),
  planStepId: z.string().nullable().optional(),
  outcome: z.enum(["completed", "partial", "postponed", "changed"]),
});

export async function outcomelogController(req: Request, res: Response) {
  const parsed = OutcomeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw HttpError.badRequest(
      "INVALID_INPUT",
      "Invalid input",
      parsed.error.flatten(),
    );
  }
  const result = await logOutcome(parsed.data);
  res.status(200).json({
    message: "Outcome logged successfully!",
    data: result,
  });
}
