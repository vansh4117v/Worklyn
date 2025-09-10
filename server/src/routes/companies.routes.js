import express from "express";
import { jwtVerifyMiddleware } from "../middlewares/authMiddleware.js";
import { isRecruiter } from "../middlewares/isRecruiter.js";
import { upload } from "../middlewares/multer.js";
import { addNewCompany, getCompanies } from "../controllers/companies.controller.js";

const router = express.Router();

router.get("/", getCompanies);
router.post("/", jwtVerifyMiddleware, isRecruiter, upload.single("logo"), addNewCompany);

export default router;
