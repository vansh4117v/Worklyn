import express from "express";
import { jwtVerifyMiddleware } from "../middlewares/authMiddleware.js";
import {
  addSavedJob,
  deleteSavedJob,
  getSavedJobs,
} from "../controllers/savedJobs.controller.js";

const router = express.Router();

router.post("/", jwtVerifyMiddleware, addSavedJob);
router.delete("/:job_id", jwtVerifyMiddleware, deleteSavedJob);
router.get("/", jwtVerifyMiddleware, getSavedJobs);

export default router;
