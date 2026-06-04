// ============================================================
// Sky Whispers Admin - Shop Service
// ============================================================

import { apiClient } from "./api";
import type { ShopItem, ShopItemFormValues, ShopFilterParams, PaginatedResponse } from "@/types";
import { buildQueryString } from "@/lib/utils";

export const shopService = {
  async getItems(params: ShopFilterParams): Promise<PaginatedResponse<ShopItem>> {
    const qs = buildQueryString(params as unknown as Record<string, unknown>);
    const response = await apiClient.get<PaginatedResponse<ShopItem>>(`/shop/items${qs}`);
    return response.data;
  },

  async getItemById(id: string): Promise<ShopItem> {
    const response = await apiClient.get<ShopItem>(`/shop/items/${id}`);
    return response.data;
  },

  async createItem(data: ShopItemFormValues): Promise<ShopItem> {
    const response = await apiClient.post<ShopItem>("/shop/items", {
      ...data,
      rmbPrice: data.rmbPrice ?? null,
    });
    return response.data;
  },

  async updateItem(id: string, data: Partial<ShopItemFormValues>): Promise<ShopItem> {
    const response = await apiClient.put<ShopItem>(`/shop/items/${id}`, {
      ...data,
      rmbPrice: data.rmbPrice ?? null,
    });
    return response.data;
  },

  async deleteItem(id: string): Promise<void> {
    await apiClient.delete(`/shop/items/${id}`);
  },

  async toggleItemStatus(id: string, status: ShopItem["status"]): Promise<ShopItem> {
    const response = await apiClient.patch<ShopItem>(`/shop/items/${id}/status`, { status });
    return response.data;
  },

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post<{ url: string }>("/shop/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
