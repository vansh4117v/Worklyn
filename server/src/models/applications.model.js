import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: [true, "Job ID is required"],
    index: true,
  },
  candidate_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Candidate ID is required"],
    index: true,
  },
  status: {
    type: String,
    enum: ["applied", "interviewing", "hired", "rejected"],
    default: "applied",
  },
  resume: {
    type: String,
    required: [true, "Resume is required"],
    trim: true,
  },
  skills: {
    type: String,
    required: [true, "Skills are required"],
    trim: true,
  },
  experience: {
    type: Number,
    required: [true, "Experience is required"],
    min: [0, "Experience must be positive"],
  },
  education: {
    type: String,
    required: [true, "Education is required"],
    enum: ["Intermediate", "Graduate", "Post Graduate"],
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [100, "Name must be at most 100 characters long"],
    trim: true,
  }
}, { timestamps: true });

const Application = mongoose.model("Application", applicationSchema);
export default Application;
