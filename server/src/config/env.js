import { z } from "zod";
import { logger } from "../utils/logger.js";
import { formatZodErrors } from "../utils/formatZodErrors.js";

const envSchema = z.object({
  PORT: z.coerce.number().min(1).default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGO_URI: z.string().min(1, "MONGO_URI is required").url("MONGO_URI must be a valid URL"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),
  SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
  SMTP_USER: z.string().min(1, "SMTP_USER is required"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),
  SENDER_EMAIL: z.string().min(1, "SENDER_EMAIL is required").email("SENDER_EMAIL must be a valid email"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
});

const validateEnv = () => {
  const parsedEnv = envSchema.safeParse(process.env);
  if (!parsedEnv.success) {
    const formattedErrors = formatZodErrors(parsedEnv.error);
    logger.error("Invalid environment variables:", formattedErrors);
    process.exit(1);
  }
  return parsedEnv.data;
};

export const config = validateEnv();
