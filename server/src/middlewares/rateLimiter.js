import rateLimit from "express-rate-limit";
import { config } from "../config/env.js";

// Production-grade, in-memory limiter configuration without Redis.
// Note: the in-memory store is fine for single-instance deployments.
// For multi-instance clusters, replace the store with a shared backend (Redis).

const isProduction = config.NODE_ENV === "production";

const defaultHandler = (req, res) => {
  return res.status(429).json({
    error: "Too many requests. Please try again later.",
  });
};

// Use user id when available to limit by account, otherwise fallback to IP
const keyGenerator = (req) => {
  try {
    if (req.user && req.user.id) return `user:${req.user.id}`;
  } catch (err) {
    // ignore
  }
  return req.ip;
};

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // max 10 requests per window per key
  message: { error: "Too many authentication attempts, try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => defaultHandler(req, res),
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // very strict (for sensitive endpoints like password reset)
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => defaultHandler(req, res),
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 200 : 1000, // more lenient in non-production for dev convenience
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (req, res) => defaultHandler(req, res),
});

// Helper factory if custom options are required elsewhere
export const createLimiter = (opts = {}) =>
  rateLimit({
    windowMs: opts.windowMs ?? 15 * 60 * 1000,
    max: opts.max ?? 100,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: opts.keyGenerator ?? keyGenerator,
    handler: opts.handler ?? defaultHandler,
  });

export default generalLimiter;
