import axios from "axios";
import { getApiBaseUrl } from "./apiUrl";
import { authTrace, describeToken } from "./authTrace";

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // ✅ required if you ever use cookies
});

// Attach Authorization header from localStorage token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    authTrace("api request", {
      method: config.method,
      baseURL: config.baseURL,
      url: config.url,
      token: describeToken(token),
    });

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    authTrace("api response", {
      method: response.config?.method,
      url: response.config?.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    authTrace("api error", {
      method: error?.config?.method,
      url: error?.config?.url,
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;
