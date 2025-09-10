import api from "./axios";
export const signUp = async (_,userData) => {
  const response = await api.post("/auth/signup", userData );
  return response.data;
};

export const signIn = async (_, userData) => {
  const response = await api.post("/auth/signin", userData );
  return response.data;
};

export const signOut = async () => {
  const response = await api.post("/auth/signout");
  return response.data;
};

export const getUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const sendEmailVerificationCode = async (_,email) => {
  const response = await api.post("/auth/send-verify-otp", { email } );
  return response.data;
};

export const verifyEmail = async (_,{email, otp}) => {
  const response = await api.post("/auth/verify-email", { email, otp });
  return response.data;
};

export const sendPasswordResetCode = async (_,email) => {
  const response = await api.post("/auth/send-reset-code", { email  });
  return response.data;
};

export const resetPassword = async (_,email, otp, newPassword) => {
  const response = await api.post("/auth/reset-password", { email, otp, newPassword });
  return response.data;
};
