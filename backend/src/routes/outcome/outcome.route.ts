import { Router } from "express";
import { outcomelogController } from "../../controller/outcome/outcome.controller.js";
import { asyncHandler } from "../../lib/async-handler.js";

const router = Router();

router.use("/outcome-log", asyncHandler(outcomelogController));

export default router;
