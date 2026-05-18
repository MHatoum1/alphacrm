// src\api\axiosInstance.ts
import axios from "axios";
import { BACKEND_BASE_URL, TIMEOUT } from "../constants";

const axiosInstance = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: TIMEOUT,
  withCredentials: false, // staying with Bearer tokens, no cookies
});

// ✅ Add this:
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    
    if (error.code === "ECONNABORTED") return Promise.reject(error);
    // Optional: on 401, clear local auth & redirect
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
