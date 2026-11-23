import { Router } from "express";
import {
  archiveGoalController,
  createGoalController,
  listGoalsController,
  updateGoalController,
  deleteGoalController,
} from "../../controller/goals/goal.controller.js";
import { asyncHandler } from "../../lib/async-handler.js";

const router = Router();

router.get("/goals", asyncHandler(listGoalsController));
router.post("/goals", asyncHandler(createGoalController));
router.patch("/goals/:id/archive", asyncHandler(archiveGoalController));
router.patch("/goals/:id", asyncHandler(updateGoalController));
router.delete("/goals/:id", asyncHandler(deleteGoalController));

export default router;
