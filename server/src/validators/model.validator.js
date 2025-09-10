import mongoose from "mongoose";
import { z } from "zod";

const objectId = () =>
  z
    .string({ required_error: "ID is required" })
    .trim()
    .refine((v) => mongoose.Types.ObjectId.isValid(v), {
      message: "Invalid ID format",
    });

export const applicationValidationSchema = z.object({
  job_id: objectId(),
  status: z.enum(["applied", "interviewing", "hired", "rejected"]).default("applied"),
  resume: z.string({ required_error: "Resume is required" }).trim(),
  skills: z.string({ required_error: "Skills are required" }).trim(),
  experience: z.coerce
    .number({ required_error: "Experience is required" })
    .min(0, "Experience must be positive"),
  education: z.enum(["Intermediate", "Graduate", "Post Graduate"], {
    required_error: "Education is required",
  }),
  name: z.string().trim().max(100),
});

export const companyValidationSchema = z.object({
  name: z
    .string({ required_error: "Company name is required" })
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be at most 100 characters"),
});

export const jobValidationSchema = z.object({
  title: z
    .string({ required_error: "Job title is required" })
    .trim()
    .min(3, "Job title must be at least 3 characters")
    .max(100, "Job title must be at most 100 characters"),
  company_id: objectId(),
  description: z
    .string({ required_error: "Job description is required" })
    .trim()
    .min(10, "Job description must be at least 10 characters"),
  location: z.string({ required_error: "Job location is required" }).trim(),
  requirements: z.string({ required_error: "Job requirements are required" }).trim(),
  isOpen: z.boolean().optional(),
});

export const savedJobValidationSchema = z.object({
  job_id: objectId(),
});

export const validateObjectIdSchema = z.object({
  id: objectId(),
});

export const updateHiringStatusSchema = z.object({
  job_id: objectId(),
  isOpen: z.boolean({ required_error: "isOpen status is required" }),
});

export const updateApplicationStatusSchema = z.object({
  job_id: objectId(),
  candidate_id: objectId(),
  status: z.enum(["applied", "interviewing", "hired", "rejected"]).default("applied"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const jobFilterSchema = z.object({
  location: z.string().trim().optional(),
  company_id: z.string().trim().refine((v) => !v || mongoose.Types.ObjectId.isValid(v), {
    message: "Invalid company ID format",
  }).optional(),
  searchQuery: z.string().trim().max(100).optional(),
  ...paginationSchema.shape,
});
