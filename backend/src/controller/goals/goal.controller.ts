import type { Request, Response } from "express";
import {
  createGoalSchema,
  listGoalsQuerySchema,
  updateGoalSchema,
} from "../../lib/goals/goal-schema.js";
import { HttpError } from "../../lib/http-error.js";
import {
  createGoal,
  listGoals,
  updateGoal,
  archiveGoal,
} from "../../services/goals/goal.service.js";

export async function listGoalsController(req: Request, res: Response) {
  const parsed = listGoalsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw HttpError.badRequest(
      "INVALID_QUERY",
      "Invalid query",
      parsed.error.flatten(),
    );
  }

  const goals = await listGoals(parsed.data);
  res.status(200).json({
    message: goals.length ? "Goals fetched" : "No goals found",
    data: goals,
  });
}

export async function createGoalController(req: Request, res: Response) {
  const parsed = createGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    throw HttpError.badRequest(
      "INVALID_INPUT",
      "Invalid input",
      parsed.error.flatten(),
    );
  }

  const createdGoal = await createGoal(parsed.data);
  res.status(201).json({
    message: "Goal created",
    data: createdGoal,
  });
}

export async function updateGoalController(req: Request, res: Response) {
  const id = String(req.params.id ?? "");
  if (!id) {
    throw HttpError.badRequest("GOAL_ID_REQUIRED", "Goal id is required");
  }

  const parsed = updateGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    throw HttpError.badRequest(
      "INVALID_INPUT",
      "Invalid input",
      parsed.error.flatten(),
    );
  }

  const updatedGoal = await updateGoal(id, parsed.data);
  res.status(200).json({
    message: "Goal updated",
    data: updatedGoal,
  });
}

export async function archiveGoalController(req: Request, res: Response) {
  const id = String(req.params.id ?? "");
  if (!id) {
    throw HttpError.badRequest("GOAL_ID_REQUIRED", "Goal id is required");
  }

  const goal = await archiveGoal(id);
  res.status(200).json({
    message: "Goal archived",
    data: goal,
  });
}
