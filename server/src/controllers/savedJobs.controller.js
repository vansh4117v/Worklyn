import Job from "../models/jobs.model.js";
import SavedJob from "../models/savedJobs.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { formatZodErrors } from "../utils/formatZodErrors.js";
import { savedJobValidationSchema, validateObjectIdSchema } from "../validators/model.validator.js";

export const deleteSavedJob = asyncHandler(async (req, res) => {
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
  // Only allow user to delete their own saved job
  const saved = await SavedJob.findOneAndDelete({ job_id: id, user_id: req.user.id });
  if (!saved) {
    return res.status(404).json({
      success: false,
      message: "Saved job not found",
      errors: [],
    });
  }
  res.status(200).json({
    success: true,
    message: "Saved job deleted successfully",
  });
});

export const addSavedJob = asyncHandler(async (req, res) => {
  const validate = savedJobValidationSchema.safeParse(req.body);
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Validation errors",
    });
  }
  const jobData = validate.data;
  jobData.user_id = req.user.id;
  const job = await Job.findById(jobData.job_id).lean();
  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
      errors: [],
    });
  }

  const existing = await SavedJob.findOne({
    job_id: jobData.job_id,
    user_id: jobData.user_id,
  }).lean();
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "Job already saved",
      errors: [],
    });
  }

  const saved = await SavedJob.create(jobData);
  res.status(201).json({
    success: true,
    message: "Job saved successfully",
    data: saved,
  });
});

export const getSavedJobs = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const savedJobs = await SavedJob.find({ user_id: id })
    .populate({
      path: "job_id",
      populate: {
        path: "company_id",
        select: "name logo_url",
      },
    })
    .lean();
  const jobsWithCompany = savedJobs.map((savedJob) => {
    const newJob = { ...savedJob };
    newJob.job = savedJob.job_id;
    delete newJob.job_id;
    if (newJob.job && newJob.job.company_id) {
      newJob.job.company = newJob.job.company_id;
      delete newJob.job.company_id;
    } else {
      newJob.job.company = null;
    }
    return newJob;
  });
  res.status(200).json({
    success: true,
    message: "Saved jobs retrieved successfully",
    data: jobsWithCompany,
  });
});
