import type { Request, Response } from "express";
import type { PlanStep } from "../../generated/prisma/client.js";
import { HttpError } from "../../lib/http-error.js";
import {
  planStepSchema,
  type PlanStepInput,
} from "../../lib/sub-plan/sub-plan-schema.js";
import {
  createPlanStep,
  archivePlanStep,
  getNextPlanStep,
  getPlanStep,
  listPlanSteps,
  updatePlanStep,
} from "../../services/sub-plan/sub-plan.service.js";

/** ISO string from JSON → Date Prisma can store; missing means not started. */
function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  return new Date(value);
}

/** goalId from the URL wins over the body so the step stays on that goal. */
function readPlanStep(req: Request): PlanStepInput {
  const goalId = String(req.params.goalId ?? req.body?.goalId ?? "");
  const parsed = planStepSchema.safeParse({ ...req.body, goalId });
  if (!parsed.success) {
    throw HttpError.badRequest(
      "INVALID_INPUT",
      "Invalid input",
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

/** Shared fields both create and update send to the service. */
function planStepData(input: PlanStepInput) {
  return {
    goalId: input.goalId,
    title: input.title,
    sortOrder: input.sortOrder,
    status: input.status,
    startedAt: toDate(input.startedAt),
  };
}

export async function createPlanStepController(
  req: Request,
  res: Response,
): Promise<void> {
  const created = await createPlanStep(
    planStepData(readPlanStep(req)) as PlanStep,
  );
  res.status(201).json({
    message: "Plan step created",
    data: created,
  });
}

export async function updatePlanStepController(
  req: Request,
  res: Response,
): Promise<void> {
  // Step id picks the one row to change; goalId only says which goal it belongs to.
  const id = String(req.params.id ?? "");
  if (!id) {
    throw HttpError.badRequest(
      "STEP_ID_REQUIRED",
      "Plan step id is required for the operation",
    );
  }

  const updated = await updatePlanStep({
    id,
    ...planStepData(readPlanStep(req)),
  } as PlanStep);
  res.status(200).json({
    message: "Plan step updated",
    data: updated,
  });
}

export async function archivePlanStepController(
  req: Request,
  res: Response,
): Promise<void> {
  const id = String(req.params.id ?? "");
  if (!id) {
    throw HttpError.badRequest(
      "STEP_ID_REQUIRED",
      "Plan step id is required for the operation",
    );
  }
  // Keeps the row; list and next-step skip status archived.
  const archived = await archivePlanStep({ id } as PlanStep);
  res.status(200).json({
    message: "Plan step archived",
    data: archived,
  });
}

export async function listPlanStepsController(
  req: Request,
  res: Response,
): Promise<void> {
  const goalId = String(req.params.goalId ?? "");
  if (!goalId) {
    throw HttpError.badRequest(
      "GOAL_ID_REQUIRED",
      "Goal id is required for the operation",
    );
  }
  const listed = await listPlanSteps(goalId);
  res.status(200).json({
    message: "Plan steps listed",
    data: listed,
  });
}

export async function getPlanStepController(
  req: Request,
  res: Response,
): Promise<void> {
  const goalId = String(req.params.goalId ?? "");
  const stepId = String(req.params.id ?? "");
  if (!goalId || !stepId) {
    throw HttpError.badRequest(
      "GOAL_ID_AND_STEP_ID_REQUIRED",
      "Goal id and step id are required for the operation",
    );
  }
  const singlelisting = await getPlanStep(goalId, stepId);
  if (!singlelisting) {
    throw HttpError.notFound("PLAN_STEP_NOT_FOUND", "Plan step not found");
  }
  res.status(200).json({
    message: "Plan step listed",
    data: singlelisting,
  });
}

export async function getNextPlanStepController(
  req: Request,
  res: Response,
): Promise<void> {
  const goalId = String(req.params.goalId ?? "");
  if (!goalId) {
    throw HttpError.badRequest(
      "GOAL_ID_REQUIRED",
      "Goal id is required for the operation",
    );
  }
  // First step that is not done, skipped, or archived.
  const next = await getNextPlanStep(goalId);
  res.status(200).json({
    message: next ? "Next plan step" : "No plan step left",
    data: next,
  });
}
