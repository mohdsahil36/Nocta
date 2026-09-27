import { Router } from "express";
import { fetchNoctaCommitHistoryController } from "../controller/activity.controller.js";

const router = Router();

router.get("/activity/commits", fetchNoctaCommitHistoryController);

export default router;
