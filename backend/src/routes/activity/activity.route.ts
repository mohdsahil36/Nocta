import { Router } from "express";
import { fetchNoctaCommitHistoryController } from "../../controller/activity/activity.controller.js";
import { asyncHandler } from "../../lib/async-handler.js";

const router = Router();

router.get("/activity/commits", asyncHandler(fetchNoctaCommitHistoryController));

export default router;
