import type { Request, Response } from "express";
import { checkInService } from "../../services/check-in/check-in.service.js";
import { checkInSchema } from "../../lib/check-in/check-in-schema.js";
import { HttpError } from "../../lib/http-error.js";

export async function checkInController(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = checkInSchema.safeParse(req.body);
  if (!parsed.success) {
    throw HttpError.badRequest(
      "INVALID_INPUT",
      "Invalid input",
      parsed.error.flatten(),
    );
  }

  const result = await checkInService(parsed.data);
  res.status(200).json({
    message: "Status updated :checked in successfully",
    data: result,
  });
}
