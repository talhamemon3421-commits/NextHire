import { Router } from "express";
import rateLimit from "express-rate-limit";

import { loginController } from "./auth.controller.js";
import { validate } from "../../middlewares/validationMiddleware.js";
import { loginSchema } from "./auth.validation.js";

// ─── Login Rate Limiter ─────────────────────────────
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

// ─── Routes ─────────────────────────────────────────
const router = Router();

router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  loginController
);

export default router;