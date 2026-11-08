import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { aiParseLogController } from "../../controller/log-parser/log-parser.controller.js";

const router = Router();

router.post("/ai/parse-log", asyncHandler(aiParseLogController));

export default router;
