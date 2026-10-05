import { z } from "zod";
import { GoalStatus } from "../generated/prisma/enums.js";
const deadlineSchema = z.iso.datetime().optional().nullable();

export const createGoalSchema = z.object({
  userId: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  weight: z.number().int().min(1).max(100),
  deadline: deadlineSchema,
  nextAction: z.string().trim().min(1).max(240),
  status: z.enum(GoalStatus).default(GoalStatus.active),
});

export const updateGoalSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  weight: z.number().int().min(1).max(100).optional(),
  deadline: deadlineSchema,
  nextAction: z.string().trim().min(1).max(240).optional(),
  status: z.enum(GoalStatus).optional(),
});

export const listGoalsQuerySchema = z.object({
  userId: z.string().min(1),
  status: z.enum(GoalStatus).optional().default(GoalStatus.active),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type ListGoalsQuery = z.infer<typeof listGoalsQuerySchema>;
