import { create } from "zustand";

export type UserRole = "USER" | "FREELANCER" | "COMPANY" | "ADMIN";

export interface CurrentUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  
  // Actions
  setAuth: (token: string, user: CurrentUser) => void;
  clearAuth: () => void;
  setInitializing: (value: boolean) => void;
  updateUserProfile: (profile: Partial<CurrentUser>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  setAuth: (token, user) =>
    set({
      accessToken: token,
      user,
      isAuthenticated: true,
    }),

  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    }),

  setInitializing: (value) =>
    set({
      isInitializing: value,
    }),
    
  updateUserProfile: (profile) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...profile } : null
    })),
}));
