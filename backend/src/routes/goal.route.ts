import { Router } from "express";
import {
  archiveGoalController,
  createGoalController,
  listGoalsController,
  updateGoalController,
} from "../controller/goal.controller.js";

const router = Router();

router.get("/goals", listGoalsController);
router.post("/goals", createGoalController);
router.patch("/goals/:id/archive", archiveGoalController);
router.patch("/goals/:id", updateGoalController);

export default router;
