"use client";

import React from "react";
import { UserTable } from "@/components/users/UserTable";
import { UserFilter } from "@/components/users/UserFilter";
import { useUsers } from "@/hooks/useUsers";

export default function UsersPage() {
  const {
    users,
    totalUsers,
    totalPages,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
  } = useUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">用户管理</h1>
        <p className="text-muted-foreground">查看和管理所有游戏用户</p>
      </div>

      <UserFilter filters={filters} onFiltersChange={setFilters} onReset={resetFilters} />

      <UserTable
        users={users}
        totalUsers={totalUsers}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
