import express from "express";
import { jwtVerifyMiddleware } from "../middlewares/authMiddleware.js";
import { isRecruiter } from "../middlewares/isRecruiter.js";
import {
  getSingleJob,
  updateHiringStatus,
  addNewJob,
  getMyJobs,
  deleteJob,
  getAllJobs,
} from "../controllers/jobs.controller.js";

const router = express.Router();

router.get("/", jwtVerifyMiddleware, getAllJobs);
router.get("/get-my-jobs", jwtVerifyMiddleware, isRecruiter, getMyJobs);
router.get("/:jobId", jwtVerifyMiddleware, getSingleJob);
router.post("/", jwtVerifyMiddleware, isRecruiter, addNewJob);
router.patch("/hiring-status", jwtVerifyMiddleware, isRecruiter, updateHiringStatus);
router.delete("/:job_id", jwtVerifyMiddleware, isRecruiter, deleteJob);

export default router;
