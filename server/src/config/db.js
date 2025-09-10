import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { config } from "./env.js";

export default async function connectDB() {
  try {
    const uri = config.MONGO_URI;
    await mongoose.connect(uri);
    mongoose.connection.on("connected", () => {
      logger.info("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("Mongoose disconnected from MongoDB");
    });
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("Database connection error:", error);
    throw error;
  }
}
