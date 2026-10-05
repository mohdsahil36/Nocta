import type { Request, Response } from "express";
import {
  createGoalSchema,
  listGoalsQuerySchema,
  updateGoalSchema,
} from "../lib/goal-schema.js";
import {
  createGoal,
  listGoals,
  updateGoal,
  archiveGoal,
} from "../services/goal.service.js";

export async function listGoalsController(req: Request, res: Response) {
  const parsed = listGoalsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query",
      details: parsed.error.flatten(),
    });
  }

  try {
    const goals = await listGoals(parsed.data);
    return res.status(200).json({
      message: goals.length ? "Goals fetched" : "No goals found",
      data: goals,
    });
  } catch (error) {
    console.error("Error listing goals", error);
    return res.status(500).json({ error: "Failed to list goals" });
  }
}

export async function createGoalController(req: Request, res: Response) {
  const parsed = createGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: parsed.error.flatten(),
    });
  }

  try {
    const createdGoal = await createGoal(parsed.data);
    return res.status(201).json({
      message: "Goal created",
      data: createdGoal,
    });
  } catch (error) {
    console.error("Error creating goal", error);
    return res.status(500).json({ error: "Failed to create goal" });
  }
}

export async function updateGoalController(req: Request, res: Response) {
  const id = String(req.params.id ?? "");
  if (!id) {
    return res.status(400).json({ error: "Goal id is required" });
  }

  const parsed = updateGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: parsed.error.flatten(),
    });
  }

  try {
    const updatedGoal = await updateGoal(id, parsed.data);
    return res.status(200).json({
      message: "Goal updated",
      data: updatedGoal,
    });
  } catch (error) {
    console.error("Error updating goal", error);
    return res.status(500).json({ error: "Failed to update goal" });
  }
}

export async function archiveGoalController(req: Request, res: Response) {
  const id = String(req.params.id ?? "");
  if (!id) {
    return res.status(400).json({ error: "Goal id is required" });
  }

  try {
    const goal = await archiveGoal(id);
    return res.status(200).json({
      message: "Goal archived",
      data: goal,
    });
  } catch (error) {
    console.error("Error archiving goal", error);
    return res.status(500).json({ error: "Failed to archive goal" });
  }
}
