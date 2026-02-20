import api from "../utils/axiosInstance";

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("No token found, user is not logged in yet");
    return null;
  }

  try {
    const res = await api.get("/users/me");
    console.log("Profile:", res.data);
    return res.data.user;
  } catch (err) {
    console.error("Error fetching profile:", err.response?.status, err.response?.data);
    return null;
  }
};



// Update logged-in user profile
export const updateProfile = async (payload) => {
  const res = await api.put("/users/me", payload);
  return res.data.user;
};

// Logout
export const logoutUser = async () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("interview_email");
};
