import { Router } from "express";
import activityRoutes from "./activity/activity.route.js";
import checkInRoutes from "./check-in/check-in.route.js";
import goalRoutes from "./goals/goal.route.js";
import planStepRoutes from "./sub-plan/sub-plan.route.js";
import useRoutes from "./user/user.route.js";
import reasoningRoute from "./ai-reasoning/ai-reasoning.route.js";

const router = Router();

router.use(activityRoutes);
router.use(checkInRoutes);
router.use(goalRoutes);
router.use(planStepRoutes);
router.use(useRoutes);
router.use(reasoningRoute);

export default router;
