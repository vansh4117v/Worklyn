import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

// Generate an access token
export const generateToken = (userId, role, expiresIn = config.JWT_EXPIRES_IN) => {
  if (!userId || !role) {
    throw new Error("User ID and role are required to generate token");
  }

  return jwt.sign({ id: userId, role }, config.JWT_SECRET, {
    expiresIn,
    issuer: "worklyn-api",
    audience: "worklyn-client",
  });
};

// Verify a token
export const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is required");
  }

  try {
    return jwt.verify(token, config.JWT_SECRET, {
      issuer: "worklyn-api",
      audience: "worklyn-client",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    } else {
      throw new Error("Token verification failed");
    }
  }
};

// Generate a refresh token (longer-lived token)
export const generateRefreshToken = (userId, role) => {
  return generateToken(userId, role, "30d");
};

// Decode a token (without verification)
export const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    throw new Error("Token decoding failed");
  }
};
