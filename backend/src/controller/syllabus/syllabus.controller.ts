import type { Request, Response } from "express";
import { HttpError } from "../../lib/http-error.js";
import prisma from "../../lib/prisma.js";
import { generateSyllabus } from "../../services/syllabus/syllabus.service.js";

export async function syllabusController(req: Request, res: Response) {
  const goalId = String(req.params.goalId ?? "");
  if (!goalId)
    throw HttpError.badRequest("GOAL_ID_REQUIRED", "Goal id is required");

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) throw HttpError.notFound("GOAL_NOT_FOUND", "Goal not found");

  const result = await generateSyllabus(goal.name, goal.nextAction ?? null);
  res.status(200).json(result);
}
