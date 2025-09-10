import { config } from "../config/env.js";
import User from "../models/user.model.js";
import { clearCookieOptions, cookieOptions } from "../utils/cookieOptions.js";
import { formatZodErrors } from "../utils/formatZodErrors.js";
import { generateToken } from "../utils/jwt.js";
import { logger } from "../utils/logger.js";
import crypto from "crypto";
import {
  resetPasswordSchema,
  sendCodeSchema,
  signInValidationSchema,
  signUpValidationSchema,
  verifyEmailSchema,
} from "../validators/user.validator.js";
import { transporter } from "../utils/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../utils/emailTemplate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const signUpController = asyncHandler(async (req, res) => {
  const validate = signUpValidationSchema.safeParse(req.body);
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Validation errors",
    });
  }
  const userData = validate.data;
  const existingUser = await User.exists({ email: userData.email });
  if (existingUser) {
    logger.warn("Registration attempt with existing email", {
      email: userData.email,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    return res.status(400).json({
      success: false,
      message: "Email is already registered",
      errors: [{ field: "email", message: "Email is already registered" }],
    });
  }
  const newUser = new User(userData);
  logger.info("User registered successfully", {
    userId: newUser._id,
    email: newUser.email,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  const otp = crypto.randomInt(100000, 999999).toString();
  newUser.verifyOtp = otp;
  newUser.verifyOtpExpireAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  await newUser.save(); // OTP will be hashed by pre-save hook

  const htmlContent = EMAIL_VERIFY_TEMPLATE.replace("{{email}}", newUser.email).replace(
    "{{otp}}",
    otp
  );

  const mailOptions = {
    from: `Worklyn <${config.SENDER_EMAIL}>`,
    to: newUser.email,
    subject: "Your Worklyn Verification OTP",
    html: htmlContent,
    text: `Hello ${newUser.name},\n\nYour OTP for verifying your Worklyn account is: ${otp}\nThis OTP is valid for 1 hour.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe Worklyn Team`,
  };
  await transporter.sendMail(mailOptions);
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: newUser,
  });
});

export const signInController = asyncHandler(async (req, res) => {
  const validate = signInValidationSchema.safeParse(req.body);
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Validation errors",
    });
  }
  const userData = validate.data;
  const user = await User.findOne({ email: userData.email }).select("+password +isAccountVerified");
  let isPasswordMatch = false;
  if (user) {
    isPasswordMatch = await user.comparePassword(userData.password);
  }
  if (!user || !isPasswordMatch) {
    logger.warn("Failed login attempt", {
      email: userData.email,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      reason: !user ? "user_not_found" : "invalid_password",
    });
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
      errors: [],
    });
  }
  if (!user.isAccountVerified) {
    return res.status(403).json({
      success: false,
      message: "Account is not verified. Please verify your email.",
      errors: [],
    });
  }
  const token = generateToken(user._id, user.role);
  logger.info("User signed in successfully", {
    userId: user._id,
    email: user.email,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  res.status(200).cookie("token", token, cookieOptions).json({
    success: true,
    message: "User signed in successfully",
    data: user,
  });
});

export const signOutController = asyncHandler((req, res) => {
  logger.info("User logged out", {
    userId: req.user?._id,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  res.clearCookie("token", clearCookieOptions).status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});

export const getUserController = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).lean();
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      errors: [],
    });
  }
  res.status(200).json({
    success: true,
    message: "User retrieved successfully",
    data: user,
  });
});

export const sendVerifyOtpController = asyncHandler(async (req, res) => {
  const validate = sendCodeSchema.safeParse(req.body);
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Validation errors",
    });
  }
  const { email } = validate.data;
  const user = await User.findOne({ email }).select(
    "+verifyOtp +verifyOtpExpireAt +isAccountVerified"
  );
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      errors: [],
    });
  }
  if (user.isAccountVerified) {
    return res.status(400).json({
      success: false,
      message: "Account is already verified",
      errors: [],
    });
  }
  // Generate OTP and expiry
  const otp = crypto.randomInt(100000, 999999).toString();
  user.verifyOtp = otp;
  user.verifyOtpExpireAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  await user.save(); // OTP will be hashed by pre-save hook

  const htmlContent = EMAIL_VERIFY_TEMPLATE.replace("{{email}}", user.email).replace(
    "{{otp}}",
    otp
  );

  const mailOptions = {
    from: `Worklyn <${config.SENDER_EMAIL}>`,
    to: user.email,
    subject: "Your Worklyn Verification OTP",
    html: htmlContent,
    text: `Hello ${user.name},\n\nYour OTP for verifying your Worklyn account is: ${otp}\nThis OTP is valid for 1 hour.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe Worklyn Team`,
  };
  await transporter.sendMail(mailOptions);
  logger.debug("Verification OTP email sent", {
    userId: user._id,
    email: user.email,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  res.status(200).json({
    success: true,
    message: "Verification OTP sent to email",
  });
});

export const verifyEmailController = asyncHandler(async (req, res) => {
  const validate = verifyEmailSchema.safeParse(req.body);
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Validation errors",
    });
  }
  const { email, otp } = validate.data;
  const user = await User.findOne({ email }).select(
    "+verifyOtp +verifyOtpExpireAt +isAccountVerified"
  );
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      errors: [],
    });
  }
  if (user.isAccountVerified) {
    return res.status(400).json({
      success: false,
      message: "Account is already verified",
      errors: [],
    });
  }
  const isOtpValid = await user.compareOtp(otp, "verifyOtp");
  if (!isOtpValid || Date.now() > user.verifyOtpExpireAt) {
    logger.warn("Invalid or expired OTP attempt", {
      userId: user._id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP",
      errors: [],
    });
  }
  user.isAccountVerified = true;
  user.verifyOtp = null;
  user.verifyOtpExpireAt = null;
  await user.save();
  logger.info("User email verified successfully", {
    userId: user._id,
    email: user.email,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  const token = generateToken(user._id, user.role);
  res.status(200).cookie("token", token, cookieOptions).json({
    success: true,
    message: "Email verified successfully",
    data: user,
  });
});

export const sendPasswordCodeController = asyncHandler(async (req, res) => {
  const validate = sendCodeSchema.safeParse(req.body);
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Validation errors",
    });
  }
  const { email } = validate.data;
  const user = await User.findOne({ email }).select("+resetOtp +resetOtpExpireAt");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      errors: [],
    });
  }
  const otp = crypto.randomInt(100000, 999999).toString();
  user.resetOtp = otp;
  user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save(); // OTP will be hashed by pre-save hook

  const htmlContent = PASSWORD_RESET_TEMPLATE.replace("{{email}}", user.email).replace(
    "{{otp}}",
    otp
  );

  const mailOptions = {
    from: `Worklyn <${config.SENDER_EMAIL}>`,
    to: user.email,
    subject: "Your Worklyn Password Reset OTP",
    html: htmlContent,
    text: `Hello ${user.name},\n\nYour OTP for resetting your Worklyn account password is: ${otp}\nThis OTP is valid for 15 minutes.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe Worklyn Team`,
  };
  await transporter.sendMail(mailOptions);
  logger.debug("Password reset OTP email sent", {
    userId: user._id,
    email: user.email,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  res.status(200).json({
    success: true,
    message: "Password reset OTP sent to email",
  });
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  const validate = resetPasswordSchema.safeParse(req.body);
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Validation errors",
    });
  }
  const { email, otp, newPassword } = validate.data;
  const user = await User.findOne({ email }).select("+resetOtp +resetOtpExpireAt +password");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      errors: [],
    });
  }
  const isOtpValid = await user.compareOtp(otp, "resetOtp");
  if (!isOtpValid || Date.now() > user.resetOtpExpireAt) {
    logger.warn("Invalid or expired reset OTP attempt", {
      userId: user._id,
      email: user.email,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    return res.status(400).json({
      success: false,
      message: "Invalid or expired OTP",
      errors: [],
    });
  }
  user.password = newPassword;
  user.resetOtp = null;
  user.resetOtpExpireAt = null;
  await user.save();
  logger.info("User password reset successfully", {
    userId: user._id,
    email: user.email,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});
