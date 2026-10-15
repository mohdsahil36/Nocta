import type { Request, Response } from "express";
import type { PlanStep } from "../../generated/prisma/client.js";
import { PlanStepStatus } from "../../generated/prisma/enums.js";
import { HttpError } from "../../lib/http-error.js";
import { addSubPlan } from "../../services/sub-plan/sub-plan.service.js";
import { z } from "zod";

const addSubPlanSchema = z.object({
  goalId: z.string().min(1), // which Goal owns this step
  title: z.string().trim().min(1),
  sortOrder: z.number().int().min(0),
  status: z.enum(PlanStepStatus).default(PlanStepStatus.todo),
  // JSON sends ISO strings, not Date objects
  startedAt: z.iso.datetime().optional().nullable(),
});

export async function addSubPlanController(
  req: Request,
  res: Response,
): Promise<void> {
  // Prefer route param when mounted as POST /goals/:goalId/plan
  const goalId = String(req.params.goalId ?? req.body?.goalId ?? "");
  const parsed = addSubPlanSchema.safeParse({ ...req.body, goalId });
  if (!parsed.success) {
    throw HttpError.badRequest(
      "INVALID_INPUT",
      "Invalid input",
      parsed.error.flatten(),
    );
  }

  const { title, sortOrder, status, startedAt } = parsed.data;
  const created = await addSubPlan({
    goalId: parsed.data.goalId,
    title,
    sortOrder,
    status,
    startedAt: startedAt ? new Date(startedAt) : null,
  } as PlanStep);

  res.status(201).json({
    message: "Plan step created",
    data: created,
  });
}
