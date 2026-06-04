// ============================================================
// Sky Whispers Admin - Shop Hook
// ============================================================

import { useState, useCallback, useEffect } from "react";
import type { ShopItem, ShopItemFormValues, ShopFilterParams, PaginatedResponse } from "@/types";
import { shopService } from "@/services/shop";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

interface UseShopReturn {
  items: ShopItem[];
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: ShopFilterParams;
  setFilters: (filters: Partial<ShopFilterParams>) => void;
  fetchItems: () => Promise<void>;
  createItem: (data: ShopItemFormValues) => Promise<ShopItem>;
  updateItem: (id: string, data: Partial<ShopItemFormValues>) => Promise<ShopItem>;
  deleteItem: (id: string) => Promise<void>;
  toggleStatus: (id: string, status: ShopItem["status"]) => Promise<void>;
}

const defaultFilters: ShopFilterParams = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

export function useShop(): UseShopReturn {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ShopFilterParams>(defaultFilters);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse<ShopItem> = await shopService.getItems(filters);
      setItems(response.data);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "获取商品列表失败";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const setFilters = useCallback((newFilters: Partial<ShopFilterParams>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const createItem = useCallback(async (data: ShopItemFormValues) => {
    const item = await shopService.createItem(data);
    await fetchItems();
    return item;
  }, [fetchItems]);

  const updateItem = useCallback(async (id: string, data: Partial<ShopItemFormValues>) => {
    const item = await shopService.updateItem(id, data);
    await fetchItems();
    return item;
  }, [fetchItems]);

  const deleteItem = useCallback(async (id: string) => {
    await shopService.deleteItem(id);
    await fetchItems();
  }, [fetchItems]);

  const toggleStatus = useCallback(async (id: string, status: ShopItem["status"]) => {
    await shopService.toggleItemStatus(id, status);
    await fetchItems();
  }, [fetchItems]);

  return {
    items,
    totalItems,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    toggleStatus,
  };
}
