import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/authStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8082/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor: Tự động đính kèm Access Token vào header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Xử lý hàng đợi (Queue) các request bị dừng khi đang đợi refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
};

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 3. Response Interceptor: Tự động bắt lỗi 401 và refresh token ngầm
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomRequestConfig;
    if (!originalRequest) return Promise.reject(error);

    // Kiểm tra xem lỗi có phải do hết hạn JWT (401) và chưa thử lại (Retry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem("refresh_token");
        if (!storedRefreshToken) {
          throw new Error("No refresh token stored");
        }

        // Gọi API refresh token của Spring Boot (truyền JSON Body)
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken: storedRefreshToken }
        );

        const { access_token, refresh_token } = response.data.data;
        
        // Lưu trữ Refresh Token mới vào localStorage
        localStorage.setItem("refresh_token", refresh_token);

        // Lấy thông tin user hiện tại để cập nhật Store
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setAuth(access_token, currentUser);
        }

        processQueue(null, access_token);
        
        // Cấu hình lại request ban đầu với token mới và chạy lại
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Dọn dẹp session và chuyển hướng về trang login
        useAuthStore.getState().clearAuth();
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
