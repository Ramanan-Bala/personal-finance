import { toastStore } from "@/lib/store/toast-store";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    showSuccessToast?: boolean;
  }
}

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Flag to track if a token refresh is in progress
let isRefreshing = false;
// Queue to store requests that failed with 401 while refreshing
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

/**
 * Process the failed request queue after refresh attempt
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

const apiMap: any = {
  transactions: "Transaction",
  accounts: "Account",
  categories: "Category",
  profile: "Profile",
  users: "User profile",
};

api.interceptors.request.use(
  (config) => {
    // await new Promise((resolve) => setTimeout(resolve, 2000));
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
  },
);

api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    const showSuccessToast = response.config.showSuccessToast ?? false;

    // Only for mutating requests
    if (
      showSuccessToast &&
      (method === "post" ||
        method === "patch" ||
        method === "put" ||
        method === "delete")
    ) {
      const pathname = new URL(response.request.responseURL).pathname;
      const source = apiMap[pathname.split("/")[2]];

      console.log(pathname);

      const message =
        (response.data as any)?.message ||
        `${source} ${method == "post" ? "created" : method == "patch" ? "updated" : "deleted"} successfully`;

      toastStore.getState().addToast({
        title: "Success",
        description: message,
        type: "success",
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(function (resolve, reject) {
        // Attempt to refresh the token using base axios to avoid recursion
        axios
          .post(
            "http://localhost:8080/api/auth/refresh",
            {
              refreshToken: localStorage.getItem("refreshToken"),
            },
            {
              withCredentials: true,
            },
          )
          .then(({ data }) => {
            if (data?.accessToken) {
              if (typeof window !== "undefined") {
                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);
              }

              // Update authorization header for the original request and the default config
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

              processQueue(null, data.accessToken);
              resolve(api(originalRequest));
            } else {
              // Refresh failed to return tokens
              processQueue(new Error("Refresh failed"), null);
              reject(new Error("Token refresh returned no data"));
            }
          })
          .catch((refreshError) => {
            processQueue(refreshError, null);

            // Global failure: Clear tokens and potentially redirect
            if (typeof window !== "undefined") {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              // window.location.href = "/login"; // Optional: Force redirect
            }

            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    // Global Error Handling (non-401 or failed refresh)
    if (error.response) {
      if (error.response.status !== 401) {
        const message =
          (error.response.data as any)?.message ||
          "An unexpected error occurred.";

        toastStore.getState().addToast({
          title: "Error",
          description: message,
          type: "error",
        });
      }
    } else if (error.request) {
      toastStore.getState().addToast({
        title: "Network Error",
        description: "Please check your internet connection.",
        type: "error",
      });
    }

    return Promise.reject(error);
  },
);

export default api;
