"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { UserFilterParams, UserStatus } from "@/types";
import { Search, X } from "lucide-react";

interface UserFilterProps {
  filters: UserFilterParams;
  onFiltersChange: (filters: Partial<UserFilterParams>) => void;
  onReset: () => void;
}

export function UserFilter({ filters, onFiltersChange, onReset }: UserFilterProps) {
  const hasActiveFilters = filters.search || filters.status !== "all" || filters.levelMin || filters.levelMax;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索昵称或ID..."
          value={filters.search || ""}
          onChange={(e) => onFiltersChange({ search: e.target.value || undefined })}
          className="pl-9"
        />
      </div>

      {/* Status filter */}
      <Select
        value={filters.status || "all"}
        onValueChange={(value) => onFiltersChange({ status: value as UserStatus | "all" })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="状态筛选" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部状态</SelectItem>
          <SelectItem value="active">活跃</SelectItem>
          <SelectItem value="inactive">不活跃</SelectItem>
          <SelectItem value="banned">封禁</SelectItem>
        </SelectContent>
      </Select>

      {/* Level range */}
      <div className="flex items-center gap-2">
        <Label className="text-sm text-muted-foreground whitespace-nowrap">等级</Label>
        <Input
          type="number"
          placeholder="最低"
          value={filters.levelMin || ""}
          onChange={(e) => onFiltersChange({ levelMin: e.target.value ? Number(e.target.value) : undefined })}
          className="w-20 h-9"
          min={0}
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="number"
          placeholder="最高"
          value={filters.levelMax || ""}
          onChange={(e) => onFiltersChange({ levelMax: e.target.value ? Number(e.target.value) : undefined })}
          className="w-20 h-9"
          min={0}
        />
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="h-9">
          <X className="h-4 w-4 mr-1" />
          清除
        </Button>
      )}
    </div>
  );
}
