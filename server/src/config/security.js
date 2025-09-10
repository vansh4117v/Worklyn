import helmet from "helmet";
import cors from "cors";
import { config } from "./env.js";

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = config.ALLOWED_ORIGINS.split(",").map((o) => o.trim());

      // In production, don't allow requests with no origin for security
      if (!origin) {
        if (config.NODE_ENV === 'development') {
          return callback(null, true);
        } else {
          return callback(new Error("Not allowed by CORS - no origin"));
        }
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  }),
];
