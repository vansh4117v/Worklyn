import { logger } from "../utils/logger.js";

// Error-handling middleware
export const errorHandler = (err, req, res, next) => {
  // Log full error with context
  logger.error("Error occurred:", {
    name: err.name,
    code: err.code,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Start with default error object
  let error = {
    name: err.name,
    message: err.message,
    stack: err.stack,
    status: err.status || 500,
    code: err.code || null,
  };

  // Mongoose: bad ObjectId
  if (err.name === "CastError") {
    error = { ...error, message: "Resource not found", status: 404 };
  }

  // Mongoose: duplicate key
  if (err.code === 11000) {
    error = { ...error, message: "Duplicate field value entered", status: 400 };
  }

  // Mongoose: validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = { ...error, message: messages.join(", "), status: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = { ...error, message: "Invalid token", status: 401 };
  }

  if (err.name === "TokenExpiredError") {
    error = { ...error, message: "Token expired", status: 401 };
  }

  // Send response
  res.status(error.status).json({
    success: false,
    message: error.message || "Internal Server Error",
    errors: [],
    ...(process.env.NODE_ENV === "development" && { stack: error.stack, name: error.name }),
  });
};

// 404 handler
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};
