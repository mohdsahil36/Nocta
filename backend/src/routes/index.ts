import { Router } from "express";
import activityRoutes from "./activity.route.js";
import goalRoutes from "./goal.route.js";
import useRoutes from "./user.route.js";

const router = Router();

router.use(activityRoutes);
router.use(goalRoutes);
router.use(useRoutes);

export default router;
