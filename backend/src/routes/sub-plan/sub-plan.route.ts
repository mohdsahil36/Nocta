import { Router } from "express";
import {
  archivePlanStepController,
  createPlanStepController,
  getNextPlanStepController,
  getPlanStepController,
  listPlanStepsController,
  updatePlanStepController,
} from "../../controller/sub-plan/sub-plan.controller.js";
import { asyncHandler } from "../../lib/async-handler.js";

const router = Router();

// /next before /:id so "next" is not treated as a step id
router.get("/goals/:goalId/plan", asyncHandler(listPlanStepsController));
router.post("/goals/:goalId/plan", asyncHandler(createPlanStepController));
router.get("/goals/:goalId/plan/next", asyncHandler(getNextPlanStepController));
router.get("/goals/:goalId/plan/:id", asyncHandler(getPlanStepController));
router.patch("/plan/:id", asyncHandler(updatePlanStepController));
router.patch("/plan/:id/archive", asyncHandler(archivePlanStepController));

export default router;
