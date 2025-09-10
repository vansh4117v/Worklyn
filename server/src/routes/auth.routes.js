import express from "express";
import { jwtVerifyMiddleware } from "../middlewares/authMiddleware.js";
import { authLimiter, strictLimiter } from "../middlewares/rateLimiter.js";
import {
  getUserController,
  resetPasswordController,
  sendPasswordCodeController,
  sendVerifyOtpController,
  signInController,
  signOutController,
  signUpController,
  verifyEmailController,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", authLimiter, signUpController);
router.post("/signin", authLimiter, signInController);
router.post("/signout", jwtVerifyMiddleware, signOutController);
router.get("/me", jwtVerifyMiddleware, getUserController);
router.post("/send-verify-otp", authLimiter, sendVerifyOtpController);
router.post("/verify-email", strictLimiter, verifyEmailController);
router.post("/send-reset-code", authLimiter, sendPasswordCodeController);
router.post("/reset-password", strictLimiter, resetPasswordController);
export default router;
