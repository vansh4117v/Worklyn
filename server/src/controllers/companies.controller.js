import Company from "../models/companies.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadImage } from "../utils/cloudinary.js";
import { formatZodErrors } from "../utils/formatZodErrors.js";
import { companyValidationSchema } from "../validators/model.validator.js";

export const addNewCompany = asyncHandler(async (req, res) => { 
  const logoFile = req.file;
  // Only allow image files for logo
  if (!logoFile || !logoFile.mimetype.startsWith('image/')) {
    return res.status(400).json({
      success: false,
      message: "Logo file is required and must be an image",
      errors: [],
    });
  }
  const validate = companyValidationSchema.safeParse({
    name: req.body.name,
  });
  if (!validate.success) {
    const formattedErrors = formatZodErrors(validate.error);
    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: "Validation errors",
    });
  }
  const companyData = validate.data;
  const existing = await Company.findOne({ name: companyData.name });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "Company already exists",
      errors: [],
    });
  }
  let logoUrl;
  const result = await uploadImage(logoFile.path);
  if(result && result.secure_url) {
    logoUrl = result.secure_url;
  } else {
    return res.status(500).json({
      success: false,
      message: "Error uploading logo",
      errors: [],
    });
  }
  companyData.logo_url = logoUrl;
  const company = await Company.create(companyData);
  res.status(201).json({
    success: true,
    message: "Company created successfully",
    data: company,
  });
});

export const getCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find();
  res.status(200).json({
    success: true,
    message: "Companies retrieved successfully",
    data: companies,
  });
});
