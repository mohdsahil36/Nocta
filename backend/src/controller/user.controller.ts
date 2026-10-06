import { Request, Response } from "express";
import { ensureUser } from "../services/user.service.js";
import { UserSchema } from "../lib/user.schema.js";

export async function ensureUserController(req: Request, res: Response) {
  const parsed = UserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: parsed.error.flatten(),
    });
  }

  try {
    const { userId, email } = parsed.data;
    const userResponse = await ensureUser(userId, email);
    return res.status(200).json({
      message: "User Synced",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error syncing user", error);
    return res.status(500).json({
      error: "Failed to sync the user",
    });
  }
}
