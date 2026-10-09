import { Router } from "express";
import activityRoutes from "./activity/activity.route.js";
import goalRoutes from "./goals/goal.route.js";
import useRoutes from "./user/user.route.js";

const router = Router();

router.use(activityRoutes);
router.use(goalRoutes);
router.use(useRoutes);

export default router;
