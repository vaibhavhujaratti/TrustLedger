import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { register, login } from "../controllers/authController";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../middleware/asyncHandler";
import { loginSchema, registerSchema } from "../types/schemas";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60000,
  max: 5,
  message: { success: false, error: "Too many login attempts" },
});

router.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler(register)
);

router.post(
  "/login",
  loginLimiter,
  validateBody(loginSchema),
  asyncHandler(login)
);

export { router as authRouter };
