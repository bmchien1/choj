import axios from "axios";
import queryString from "query-string";
import userService from "@/apis/service/userService";
import { JWT_LOCAL_STORAGE_KEY } from "@/constants/data.ts";

const axiosClient = axios.create({
  baseURL: "https://choj-node.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => queryString.stringify(params),
});

axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem(JWT_LOCAL_STORAGE_KEY);
    if (accessToken && config.url !== "/api/auth/login") {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    console.log(`Request to ${config.url}:`, { headers: config.headers });
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      error.response?.data?.error === "Token has expired" &&
      originalRequest.url !== "/api/auth/login"
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.error("No refresh token available");
          throw new Error("No refresh token available");
        }

        const response = await userService.refreshToken(refreshToken);
        const { jwt: newAccessToken, refreshToken: newRefreshToken, user } = response;

        localStorage.setItem(JWT_LOCAL_STORAGE_KEY, newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        localStorage.setItem("userInfo", JSON.stringify(user));

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem(JWT_LOCAL_STORAGE_KEY);
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    console.error(`Response error from ${originalRequest?.url}:`, error.response?.data);
    return Promise.reject(error);
  }
);

export default axiosClient;