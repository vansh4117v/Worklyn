import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      maxlength: [100, "Password cannot exceed 100 characters"],
      select: false,
    },
    verifyOtp: {
      type: String,
      default: null,
      select: false,
    },
    verifyOtpExpireAt: {
      type: Date,
      default: null,
      select: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
    resetOtp: {
      type: String,
      default: null,
      select: false,
      minlength: [6, "Reset OTP must be 6 characters"],
      maxlength: [6, "Reset OTP must be 6 characters"],
    },
    resetOtpExpireAt: {
      type: Date,
      default: null,
      select: false,
    },
    role: {
      type: String,
      enum: ["recruiter", "candidate"],
      required: [true, "Role is required"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        delete ret.verifyOtp;
        delete ret.verifyOtpExpireAt;
        delete ret.isAccountVerified;
        delete ret.resetOtp;
        delete ret.resetOtpExpireAt;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Hash verifyOtp before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("verifyOtp") && this.verifyOtp) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.verifyOtp = await bcrypt.hash(this.verifyOtp, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Hash resetOtp before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("resetOtp") && this.resetOtp) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.resetOtp = await bcrypt.hash(this.resetOtp, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Method to compare OTP
userSchema.methods.compareOtp = async function (candidateOtp, otpType = "verifyOtp") {
  try {
    return await bcrypt.compare(candidateOtp, this[otpType]);
  } catch (error) {
    throw new Error("OTP comparison failed");
  }
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
