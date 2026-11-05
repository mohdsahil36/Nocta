import { Router } from "express";
import { aiReasoningController } from "../../controller/ai-reasoning/ai-reasoning.controller.js";
import { asyncHandler } from "../../lib/async-handler.js";

const router = Router();

router.post("/reasoning", asyncHandler(aiReasoningController));

export default router;
