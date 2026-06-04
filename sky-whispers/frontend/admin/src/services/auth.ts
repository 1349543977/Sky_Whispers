// ============================================================
// Sky Whispers Admin - Auth Service
// ============================================================

import { apiClient } from "./api";
import type { LoginRequest, LoginResponse, AdminUser } from "@/types";

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", credentials);
    apiClient.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      apiClient.clearTokens();
    }
  },

  async getProfile(): Promise<AdminUser> {
    const response = await apiClient.get<AdminUser>("/auth/profile");
    return response.data;
  },

  async refreshToken(): Promise<void> {
    // Token refresh is handled automatically by the API client interceptor
  },
};
