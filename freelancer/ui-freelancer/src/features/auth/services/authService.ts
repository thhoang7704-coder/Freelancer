import axios from "axios";
import { useAuthStore } from "../../../stores/authStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8082/api/v1";

export const authService = {
  register: async (fullName: string, email: string, password: string, role: string, phone?: string) => {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      fullName,
      email,
      password,
      role,
      ...(phone ? { phone } : {}),
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password,
    });
    
    const { access_token, refresh_token, user } = response.data.data;
    
    // Lưu Refresh Token vào localStorage
    localStorage.setItem("refresh_token", refresh_token);
    
    // Lưu Access Token & User Info vào Zustand RAM Store
    useAuthStore.getState().setAuth(access_token, user);
    
    return response.data.data;
  },

  logout: async () => {
    const storedRefreshToken = localStorage.getItem("refresh_token");
    try {
      if (storedRefreshToken) {
        await axios.post(`${BASE_URL}/auth/logout`, {
          refreshToken: storedRefreshToken,
        });
      }
    } finally {
      // Đảm bảo Frontend luôn dọn sạch Session dù cuộc gọi API có thành công hay không
      useAuthStore.getState().clearAuth();
      localStorage.removeItem("refresh_token");
    }
  },
};
