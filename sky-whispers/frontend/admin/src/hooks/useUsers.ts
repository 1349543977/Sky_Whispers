// ============================================================
// Sky Whispers Admin - Users Hook
// ============================================================

import { useState, useCallback, useEffect } from "react";
import type { User, UserDetail, UserFilterParams, PaginatedResponse } from "@/types";
import { usersService } from "@/services/users";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

interface UseUsersReturn {
  users: User[];
  totalUsers: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: UserFilterParams;
  setFilters: (filters: Partial<UserFilterParams>) => void;
  resetFilters: () => void;
  fetchUsers: () => Promise<void>;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

const defaultFilters: UserFilterParams = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export function useUsers(initialFilters?: Partial<UserFilterParams>): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<UserFilterParams>({
    ...defaultFilters,
    ...initialFilters,
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse<User> = await usersService.getUsers(filters);
      setUsers(response.data);
      setTotalUsers(response.total);
      setTotalPages(response.totalPages);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "获取用户列表失败";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const setFilters = useCallback((newFilters: Partial<UserFilterParams>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  const setPage = useCallback((page: number) => {
    setFiltersState((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setFiltersState((prev) => ({ ...prev, pageSize, page: 1 }));
  }, []);

  return {
    users,
    totalUsers,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters,
    resetFilters,
    fetchUsers,
    page: filters.page,
    setPage,
    pageSize: filters.pageSize,
    setPageSize,
  };
}

interface UseUserDetailReturn {
  user: UserDetail | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: (id: string) => Promise<void>;
  banUser: (reason: string) => Promise<void>;
  unbanUser: () => Promise<void>;
  resetProgress: () => Promise<void>;
  sendGift: (itemId: string, quantity: number) => Promise<void>;
}

export function useUserDetail(userId: string): UseUserDetailReturn {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usersService.getUserById(id);
      setUser(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "获取用户详情失败";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) fetchUser(userId);
  }, [userId, fetchUser]);

  const banUser = useCallback(
    async (reason: string) => {
      try {
        const updated = await usersService.banUser(userId, reason);
        setUser((prev) => (prev ? { ...prev, ...updated } : prev));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "封禁用户失败";
        setError(message);
      }
    },
    [userId]
  );

  const unbanUser = useCallback(async () => {
    try {
      const updated = await usersService.unbanUser(userId);
      setUser((prev) => (prev ? { ...prev, ...updated } : prev));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "解封用户失败";
      setError(message);
    }
  }, [userId]);

  const resetProgress = useCallback(async () => {
    try {
      const updated = await usersService.resetUserProgress(userId);
      setUser((prev) => (prev ? { ...prev, ...updated } : prev));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "重置用户进度失败";
      setError(message);
    }
  }, [userId]);

  const sendGift = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        await usersService.sendGift(userId, itemId, quantity);
        await fetchUser(userId);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "发送礼物失败";
        setError(message);
      }
    },
    [userId, fetchUser]
  );

  return { user, isLoading, error, fetchUser, banUser, unbanUser, resetProgress, sendGift };
}
