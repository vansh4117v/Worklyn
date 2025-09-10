import Application from "../models/applications.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  applicationValidationSchema,
  updateApplicationStatusSchema,
} from "../validators/model.validator.js";
import Job from "../models/jobs.model.js";
import { formatZodErrors } from "../utils/formatZodErrors.js";
import { uploadDocument } from "../utils/cloudinary.js";
import { equalsId } from "../utils/id.js";

export const getApplications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  let applications = await Application.find({ candidate_id: userId })
    .populate({
      path: "job_id",
      select: "title company_id isOpen",
      populate: { path: "company_id", select: "name" },
    })
    .lean();
  applications = applications.map((app) => {
    const { job_id, ...rest } = app;
    return {
      ...rest,
      job: job_id
        ? (({ company_id, ...other }) => ({ ...other, company: company_id }))(job_id)
        : null,
    };
  });

  res.status(200).json({
    success: true,
    message: "Applications retrieved successfully",
    data: applications,
  });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const validate = updateApplicationStatusSchema.safeParse(req.body);
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Validation errors",
    });
  }
  const { job_id, candidate_id, status } = validate.data;
  const job = await Job.findById(job_id).lean();
  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
      errors: [],
    });
  }
  if (!equalsId(userId, job.recruiter_id)) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to update this application",
      errors: [],
    });
  }
  const application = await Application.findOneAndUpdate(
    { job_id, candidate_id },
    { status },
    { new: true, lean: true }
  );
  if (!application) {
    return res.status(404).json({
      success: false,
      message: "Application not found",
      errors: [],
    });
  }
  res.status(200).json({
    success: true,
    message: "Application status updated successfully",
    data: application,
  });
});

export const applyToJob = asyncHandler(async (req, res) => {
  
  const userId = req.user.id;
  // If a file was uploaded (multer), upload to Cloudinary and set resume URL
  if (req.file) {
    const result = await uploadDocument(req.file.path);
    if (!result || !result.secure_url) {
      return res
        .status(500)
        .json({ success: false, message: "Error uploading resume", errors: [] });
    }
    // ensure resume sent to validator
    req.body.resume = result.secure_url;
  } else {
    return res.status(400).json({
      success: false,
      message: "Resume file is required",
      errors: [],
    });
  }
  const validate = applicationValidationSchema.safeParse(req.body);
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Validation errors",
    });
  }
  validate.data.candidate_id = userId; // enforce candidate_id to be the logged-in user
  const { job_id } = validate.data;
  const job = await Job.findById(job_id).lean();
  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
      errors: [],
    });
  }

  if (!job.isOpen) {
    return res.status(400).json({
      success: false,
      message: "Applications are closed for this job",
      errors: [],
    });
  }

  const existingApplication = await Application.findOne({
    job_id,
    candidate_id: userId,
  }).lean();
  if (existingApplication) {
    return res.status(400).json({
      success: false,
      message: "You have already applied to this job",
      errors: [],
    });
  }

  // Create application using validated data
  const applicationPayload = {
    job_id: validate.data.job_id,
    candidate_id: validate.data.candidate_id,
    resume: validate.data.resume,
    skills: validate.data.skills,
    experience: validate.data.experience,
    education: validate.data.education,
    status: validate.data.status,
    name: validate.data.name || undefined,
  };

  const application = await Application.create(applicationPayload);

  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    data: application,
  });
});
