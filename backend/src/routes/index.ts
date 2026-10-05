import { Router } from "express";
import activityRoutes from "./activity.route.js";
import goalRoutes from "./goal.route.js";

const router = Router();

router.use(activityRoutes);
router.use(goalRoutes);

export default router;
