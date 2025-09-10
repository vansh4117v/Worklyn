import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./config/env.js";
import { securityMiddleware } from "./config/security.js";
import authRouter from "./routes/auth.routes.js";
import jobsRouter from "./routes/jobs.routes.js";
import companiesRouter from "./routes/companies.routes.js";
import applicationsRouter from "./routes/applications.routes.js";
import savedJobsRouter from "./routes/savedJobs.routes.js";
import { logger, morganMiddleware } from "./utils/logger.js";
import connectDB from "./config/db.js";
import generalLimiter from "./middlewares/rateLimiter.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
const app = express();
const PORT = config.PORT;

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", true);

app.use(securityMiddleware);

// Apply a general rate limit to all API routes. This protects against
// accidental or abusive high-traffic from a single IP or user key.
app.use('/api', generalLimiter);

app.use(
  morgan(morganMiddleware, {
    stream: {
      write: (message) => {
        try {
          const data = JSON.parse(message.trim());

          // Create readable format
          const readableMessage = `${data.method} ${data.url} - Status: ${data.status} - ${data.response_time}ms - IP: ${data.ip}`;

          // Log with appropriate level based on status code
          if (data.status >= 500) {
            logger.error(readableMessage);
          } else if (data.status >= 400) {
            logger.warn(readableMessage);
          } else {
            logger.http(readableMessage);
          }
        } catch (error) {
          // Fallback for non-JSON messages
          logger.http(message.trim());
        }
      },
    },
  })
);

app.use("/api/auth", authRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/saved-jobs", savedJobsRouter);


app.get("/", (req, res) => {
  res.send("Worklyn API");
});

// Add error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const gracefulShutdown = (signal) => {
  logger.warn(`${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 30000);
};

let server;
connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      logger.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
    });
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  })
  .catch((err) => {
    logger.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection:", err);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});
