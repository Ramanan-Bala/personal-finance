import { toastStore } from "@/lib/store/toast-store";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        // We use the base axios to avoid infinite loops with our interceptors
        const { data } = await axios.post(
          "http://localhost:8080/auth/refresh",
          {
            refreshToken: localStorage.getItem("refreshToken"),
          },
          {
            withCredentials: true,
          }
        );

        // If the refresh endpoint returns a new token, update it
        if (data?.accessToken) {
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
          }
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Global Error Handling
    if (error.response) {
      // Avoid showing toast for 401s as they are handled by refresh logic or redirection
      // Only show if it's NOT a 401 or if it's a 401 that failed retry/refresh (though usually those redirect)
      // Actually, simplified: if it's 401, we generally don't want a generic "Unauthorized" toast if we are redirecting.
      // Let's show toast for everything EXCEPT 401, or if it is 401 but we aren't handling it (edge case).
      // However, the above logic handles 401. So if we reach here, it's either non-401 or a failed 401.

      if (error.response.status !== 401) {
        const message =
          error.response.data?.message || "An unexpected error occurred.";
        toastStore.getState().addToast({
          title: "Error",
          description: message,
          type: "error",
        });
      }
    } else if (error.request) {
      // Network error
      toastStore.getState().addToast({
        title: "Network Error",
        description: "Please check your internet connection.",
        type: "error",
      });
    }

    return Promise.reject(error);
  }
);

export default api;
