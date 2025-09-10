import mongoose from "mongoose";


const savedJobSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
    index: true,
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: [true, "Job ID is required"],
  }
}, {
  timestamps: true,
});

savedJobSchema.index({ user_id: 1, job_id: 1 }, { unique: true });

const savedJob = mongoose.model("SavedJob", savedJobSchema);
export default savedJob;