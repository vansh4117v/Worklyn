import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  recruiter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Recruiter ID is required"],
    index: true,
  },
  title: {
    type: String,
    required: [true, "Job title is required"],
    minlength: [3, "Job title must be at least 3 characters"],
    maxlength: [100, "Job title must be at most 100 characters"],
    trim: true,
    validate: {
      validator: function(v) {
        // Prevent XSS by rejecting HTML/script tags
        return !/<script|<\/script|javascript:|data:/i.test(v);
      },
      message: 'Job title contains invalid characters'
    }
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: [true, "Company ID is required"],
    // index: true,
  },
  description: {
    type: String,
    required: [true, "Job description is required"],
    minlength: [10, "Job description must be at least 10 characters"],
    maxlength: [5000, "Job description must be at most 5000 characters"],
    trim: true,
    validate: {
      validator: function(v) {
        // Allow basic HTML but prevent dangerous scripts
        return !/<script|<\/script|javascript:|data:|on\w+=/i.test(v);
      },
      message: 'Job description contains invalid or dangerous content'
    }
  },
  location: {
    type: String,
    required: [true, "Job location is required"],
    trim: true,
  },
  requirements: {
    type: String,
    required: [true, "Job requirements are required"],
    trim: true,
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true })

jobSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "job_id",
});

jobSchema.virtual("saved", {
  ref: "SavedJob",
  localField: "_id",
  foreignField: "job_id",
});

jobSchema.set("toObject", { virtuals: true });
jobSchema.set("toJSON", { virtuals: true });


const Job = mongoose.model("Job", jobSchema);
export default Job;