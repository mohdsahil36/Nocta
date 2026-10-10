import { Router } from "express";
import { checkInController } from "../../controller/check-in/check-in.controller.js";
import { asyncHandler } from "../../lib/async-handler.js";

const router = Router();

router.post("/check-in", asyncHandler(checkInController));

export default router;
