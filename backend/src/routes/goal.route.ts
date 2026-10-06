import { Router } from "express";
import {
  archiveGoalController,
  createGoalController,
  listGoalsController,
  updateGoalController,
} from "../controller/goal.controller.js";
import { asyncHandler } from "../lib/async-handler.js";

const router = Router();

router.get("/goals", asyncHandler(listGoalsController));
router.post("/goals", asyncHandler(createGoalController));
router.patch("/goals/:id/archive", asyncHandler(archiveGoalController));
router.patch("/goals/:id", asyncHandler(updateGoalController));

export default router;
