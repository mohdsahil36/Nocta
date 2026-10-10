import { Router } from "express";
import { ensureUserController } from "../../controller/user/user.controller.js";
import { asyncHandler } from "../../lib/async-handler.js";

const router = Router();

router.post("/users", asyncHandler(ensureUserController));

export default router;
