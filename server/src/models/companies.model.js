import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Company name is required"],
    trim: true,
    unique: true,
    minlength: [2, "Company name must be at least 2 characters"],
    maxlength: [100, "Company name must be at most 100 characters"],
    validate: {
      validator: function(v) {
        // Prevent XSS and ensure reasonable company name format
        return /^[a-zA-Z0-9\s\-&.,()]+$/.test(v) && !/<script|<\/script|javascript:|data:/i.test(v);
      },
      message: 'Company name contains invalid characters'
    }
  },
  logo_url: {
    type: String,
    required: [true, "Company logo URL is required"],
    trim: true,
    match: [/^(https?:\/\/)?([\w\-])+\.([\w\-])+([\w\-\./?%&=]*)?$/, "Invalid logo URL format"],
  }
}, { timestamps: true });

const Company = mongoose.model("Company", companySchema);
export default Company;