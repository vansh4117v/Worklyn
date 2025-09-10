import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { logger } from "./logger.js";
import { config } from "../config/env.js";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

// Upload images (jpg, png, webp, svg, gif, etc.)
const uploadImage = async (filePath, options = {}) => {
  if (!filePath) {
    logger.warn("[Cloudinary] File path is required for image upload");
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder: options.folder || "worklyn/images",
      ...options,
    });
    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkErr) {
      logger.warn(`[Cloudinary] Could not delete file after upload: ${filePath}`, unlinkErr);
    }
    logger.debug(`[Cloudinary] Image uploaded: ${result.secure_url}`);
    return result;
  } catch (error) {
    logger.error(`[Cloudinary] Error uploading image: ${error.message}`);
    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkErr) {
      logger.warn(
        `[Cloudinary] Could not delete file after failed image upload: ${filePath}`,
        unlinkErr
      );
    }
    return null;
  }
};

// Upload documents (pdf, doc, docx, etc.) as raw resources
const uploadDocument = async (filePath, options = {}) => {
  if (!filePath) {
    logger.warn("[Cloudinary] File path is required for document upload");
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder: options.folder || "worklyn/documents",
      content_type: "application/pdf",
      ...options,
    });
    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkErr) {
      logger.warn(`[Cloudinary] Could not delete file after upload: ${filePath}`, unlinkErr);
    }
    logger.debug(`[Cloudinary] Document uploaded: ${result.secure_url}`);
    return result;
  } catch (error) {
    logger.error(`[Cloudinary] Error uploading document: ${error.message}`);
    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkErr) {
      logger.warn(
        `[Cloudinary] Could not delete file after failed document upload: ${filePath}`,
        unlinkErr
      );
    }
    return null;
  }
};

// Generic upload helper - will use 'auto' resource type if caller doesn't care
const uploadOnCloudinary = async (filePath, options = {}) => {
  if (!filePath) {
    logger.warn("[Cloudinary] File path is required for upload");
    return null;
  }

  const resource_type = options.resource_type || "auto";
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type,
      folder: options.folder,
      ...options,
    });
    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkErr) {
      logger.warn(`[Cloudinary] Could not delete file after upload: ${filePath}`, unlinkErr);
    }
    logger.debug(`[Cloudinary] File uploaded: ${result.secure_url}`);
    return result;
  } catch (error) {
    logger.error(`[Cloudinary] Error uploading file: ${error.message}`);
    try {
      await fs.promises.unlink(filePath);
    } catch (unlinkErr) {
      logger.warn(`[Cloudinary] Could not delete file after failed upload: ${filePath}`, unlinkErr);
    }
    return null;
  }
};

export { uploadImage, uploadDocument, uploadOnCloudinary };
