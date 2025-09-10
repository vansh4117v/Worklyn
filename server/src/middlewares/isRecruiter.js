export const isRecruiter = (req, res, next) => {
  if (req.user && req.user.role === "recruiter") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Access is allowed for recruiters only",
      errors: [],
    });
  } 
};