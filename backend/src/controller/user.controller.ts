import type { Request, Response } from "express";
import { ensureUser } from "../services/user.service.js";
import { UserSchema } from "../lib/user.schema.js";
import { HttpError } from "../lib/http-error.js";

export async function ensureUserController(req: Request, res: Response) {
  const parsed = UserSchema.safeParse(req.body);
  if (!parsed.success) {
    throw HttpError.badRequest(
      "INVALID_INPUT",
      "Invalid input",
      parsed.error.flatten(),
    );
  }

  const { userId, email } = parsed.data;
  const userResponse = await ensureUser(userId, email);
  res.status(200).json({
    message: "User Synced",
    data: userResponse,
  });
}
