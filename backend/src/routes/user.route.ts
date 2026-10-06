import { Router } from "express";
import { ensureUserController } from "../controller/user.controller.js";

const router = Router();

router.post("/users", ensureUserController);

export default router;
