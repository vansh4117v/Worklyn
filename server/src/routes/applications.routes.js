import express from "express";
import { jwtVerifyMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/multer.js";
import {
  applyToJob,
  updateApplicationStatus,
  getApplications,
} from "../controllers/applications.controller.js";

const router = express.Router();

router.post("/apply", jwtVerifyMiddleware, upload.single("resume"), applyToJob);
router.patch("/status", jwtVerifyMiddleware, updateApplicationStatus);
router.get("/", jwtVerifyMiddleware, getApplications);

export default router;
