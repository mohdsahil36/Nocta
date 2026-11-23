import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { syllabusController } from "../../controller/syllabus/syllabus.controller.js";

const router = Router();

router.post("/goals/:goalId/syllabus", asyncHandler(syllabusController));

export default router;
