import Job from "../models/jobs.model.js";
import Company from "../models/companies.model.js";
import Application from "../models/applications.model.js";
import SavedJob from "../models/savedJobs.model.js";
import { equalsId } from "../utils/id.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  jobValidationSchema,
  updateHiringStatusSchema,
  validateObjectIdSchema,
  jobFilterSchema,
} from "../validators/model.validator.js";
import { formatZodErrors } from "../utils/formatZodErrors.js";
import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

export const getSingleJob = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId || req.body.jobId;
  const validate = validateObjectIdSchema.safeParse({ id: jobId });
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Validation errors",
    });
  }
  const id = validate.data.id;
  const job = await Job.findById(id)
    .populate({ path: "company_id", select: "name logo_url" })
    .populate({ path: "applications" })
    .lean();
  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
      errors: [],
    });
  }
  job.totalApplications = job.applications.length;

  // For non-recruiters, hide sensitive information and show if they applied
  if (!equalsId(req.user.id, job.recruiter_id)) {
    job.applied = job.applications.some((app) => equalsId(req.user.id, app.candidate_id));
    // Don't expose all applications to non-recruiters
    delete job.applications;
  }
  job.company = job.company_id;
  delete job.company_id;

  res.status(200).json({
    success: true,
    message: "Job retrieved successfully",
    data: job,
  });
});

export const updateHiringStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const validate = updateHiringStatusSchema.safeParse(req.body);
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Validation errors",
    });
  }
  const { job_id, isOpen } = validate.data;
  const job = await Job.findOneAndUpdate(
    { _id: job_id, recruiter_id: userId },
    { isOpen },
    { new: true }
  );
  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
      errors: [],
    });
  }
  res.status(200).json({
    success: true,
    message: "Job hiring status updated successfully",
    data: job,
  });
});

export const addNewJob = asyncHandler(async (req, res) => {
  const validate = jobValidationSchema.safeParse(req.body);
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Validation errors",
    });
  }
  const jobData = validate.data;
  const company = await Company.findById(jobData.company_id);
  if (!company) {
    return res.status(404).json({
      success: false,
      message: "Company not found",
      errors: [],
    });
  }
  // enforce recruiter_id from authenticated user
  jobData.recruiter_id = req.user.id;

  const job = await Job.create(jobData);
  res.status(201).json({
    success: true,
    message: "Job created successfully",
    data: job,
  });
});

export const getMyJobs = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const jobs = await Job.find({ recruiter_id: id })
    .populate({ path: "company_id", select: "name logo_url" })
    .lean();
  const jobsWithCompany = jobs.map((job) => {
    if (job.company_id) {
      job.company = job.company_id;
      delete job.company_id;
    } else {
      job.company = null;
    }
    return job;
  });
  res.status(200).json({
    success: true,
    message: "Jobs retrieved successfully",
    data: jobsWithCompany,
  });
});

export const deleteJob = asyncHandler(async (req, res) => {
  const job_id = req.params.job_id;
  const validate = validateObjectIdSchema.safeParse({ id: job_id });
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Validation errors",
    });
  }
  const id = validate.data.id;
  const job = await Job.findOneAndDelete({ _id: id, recruiter_id: req.user.id });
  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
      errors: [],
    });
  }
  // cascade delete related documents: applications and saved jobs
  const deletedApplications = await Application.deleteMany({ job_id: id });
  const deletedSavedJobs = await SavedJob.deleteMany({ job_id: id });
  logger.info(`Cascade delete for job ${id}: applications=${deletedApplications.deletedCount ?? 0}, savedJobs=${deletedSavedJobs.deletedCount ?? 0}`);
  res.status(200).json({
    success: true,
    message: "Job deleted successfully",
    data: job,
  });
});

export const getAllJobs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Validate query parameters
  const validate = jobFilterSchema.safeParse(req.query);
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Invalid query parameters",
    });
  }
  
  const { location, company_id, searchQuery, page, limit } = validate.data;
  const skip = (page - 1) * limit;
  
  const filter = { isOpen: true }; // Only show open jobs by default
  
  if (location) {
    filter.location = { $regex: location, $options: "i" };
  }
  if (company_id) {
    filter.company_id = new mongoose.Types.ObjectId(company_id);
  }
  if (searchQuery) {
    // Search in both title and description
    const searchRegex = { $regex: searchQuery, $options: "i" };
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { requirements: searchRegex }
    ];
  }

  // Get total count for pagination
  const totalJobs = await Job.countDocuments(filter);
  
  const jobs = await Job.find(filter)
    .populate({ path: "company_id", select: "name logo_url" })
    .populate({
      path: "saved",
      match: { user_id: userId },
      select: "_id",
    })
    .sort({ createdAt: -1 }) // Newest first
    .skip(skip)
    .limit(limit)
    .lean();

  const shaped = jobs.map((job) => {
    const { company_id, saved, ...rest } = job;
    return {
      ...rest,
      company: company_id || null,
      saved: saved || [],
    };
  });
  
  return res.status(200).json({
    success: true,
    message: "Jobs fetched successfully",
    data: shaped,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
      hasNext: page < Math.ceil(totalJobs / limit),
      hasPrev: page > 1,
    },
  });
});
