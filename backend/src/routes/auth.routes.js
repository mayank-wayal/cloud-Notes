import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { validateLogin, validateRegister } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/register", validateRegister, asyncHandler(register));
router.post("/login", validateLogin, asyncHandler(login));

export default router;
