// ============================================================
// Sky Whispers Admin - Users Service
// ============================================================

import { apiClient } from "./api";
import type { User, UserDetail, UserFilterParams, PaginatedResponse } from "@/types";
import { buildQueryString } from "@/lib/utils";

export const usersService = {
  async getUsers(params: UserFilterParams): Promise<PaginatedResponse<User>> {
    const qs = buildQueryString(params as unknown as Record<string, unknown>);
    const response = await apiClient.get<PaginatedResponse<User>>(`/users${qs}`);
    return response.data;
  },

  async getUserById(id: string): Promise<UserDetail> {
    const response = await apiClient.get<UserDetail>(`/users/${id}`);
    return response.data;
  },

  async banUser(id: string, reason: string): Promise<User> {
    const response = await apiClient.post<User>(`/users/${id}/ban`, { reason });
    return response.data;
  },

  async unbanUser(id: string): Promise<User> {
    const response = await apiClient.post<User>(`/users/${id}/unban`);
    return response.data;
  },

  async resetUserProgress(id: string): Promise<User> {
    const response = await apiClient.post<User>(`/users/${id}/reset`);
    return response.data;
  },

  async sendGift(userId: string, itemId: string, quantity: number): Promise<void> {
    await apiClient.post(`/users/${userId}/gift`, { itemId, quantity });
  },

  async updateUserCoins(userId: string, amount: number, reason: string): Promise<User> {
    const response = await apiClient.post<User>(`/users/${userId}/coins`, { amount, reason });
    return response.data;
  },
};
