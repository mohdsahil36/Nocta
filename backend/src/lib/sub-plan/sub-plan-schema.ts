import { z } from "zod";
import { PlanStepStatus } from "../../generated/prisma/enums.js";

/** Body for creating or replacing a plan step (JSON dates stay strings). */
export const planStepSchema = z.object({
  goalId: z.string().min(1), // parent Goal — not the step’s own id
  title: z.string().trim().min(1),
  sortOrder: z.number().int().min(0), // position in the path (0 = first)
  status: z.enum(PlanStepStatus).default(PlanStepStatus.todo),
  startedAt: z.iso.datetime().optional().nullable(), // ISO string, not a Date
});

export type PlanStepInput = z.infer<typeof planStepSchema>;
