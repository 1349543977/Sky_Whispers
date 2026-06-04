// ============================================================
// Sky Whispers Admin - Auth Hook (Zustand Store)
// ============================================================

import { create } from "zustand";
import type { AdminUser } from "@/types";
import { authService } from "@/services/auth";
import { apiClient } from "@/services/api";

interface AuthState {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  admin: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ username, password });
      set({
        admin: response.admin,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "登录失败";
      set({ isLoading: false, error: message, isAuthenticated: false, admin: null });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      set({ admin: null, isAuthenticated: false, error: null });
    }
  },

  checkAuth: async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({ isAuthenticated: false, admin: null });
      return;
    }
    try {
      set({ isLoading: true });
      const admin = await authService.getProfile();
      set({ admin, isAuthenticated: true, isLoading: false });
    } catch {
      apiClient.clearTokens();
      set({ admin: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
