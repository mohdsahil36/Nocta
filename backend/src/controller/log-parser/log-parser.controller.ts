import { Request, Response } from "express";
import { aiParseLogService } from "../../services/log-parser/log-parser.service.js";
import { HttpError } from "../../lib/http-error.js";
import z from "zod";

const parseLogSchema = z.object({
  text: z.string().min(1),
  goalName: z.string().min(1),
});

export async function aiParseLogController(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = parseLogSchema.safeParse(req.body);
  if (!parsed.success) {
    throw HttpError.badRequest(
      "INVALID_INPUT",
      "Invalid input",
      parsed.error.flatten(),
    );
  }
  const result = await aiParseLogService(parsed.data);
  res.status(200).json({
    message: "AI Logging extracted successfully!",
    data: result,
  });
}
