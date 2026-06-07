import axiosInstance from "../utils/axiosInstance";

export const signupUser = async (payload) => {
  const { data } = await axiosInstance.post("/auth/signup", payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await axiosInstance.post("/auth/login", payload);
  return data;
};

export const socialLogin = async (payload) => {
  const { data } = await axiosInstance.post("/auth/social", payload);
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await axiosInstance.post(
    "/auth/change-password",
    payload
  );
  return data;
};

// Send OTP
export const forgotPassword = async (payload) => {
  const { data } = await axiosInstance.post("/auth/forgot-password", payload);
  return data;
};

// Reset password
export const resetPassword = async (payload) => {
  const { data } = await axiosInstance.post("/auth/reset-password", payload);
  return data;
};