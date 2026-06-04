"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/services/api";
import { toast } from "@/hooks/useToast";
import type { Island, User, WeatherType, PaginatedResponse } from "@/types";
import { WEATHER_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Search, Palmtree } from "lucide-react";

export default function IslandsPage() {
  const [islands, setIslands] = useState<Island[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [weatherFilter, setWeatherFilter] = useState<WeatherType | "all">("all");

  const fetchIslands = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = { page: "1", pageSize: "50" };
      if (search) params.search = search;
      if (weatherFilter !== "all") params.weatherType = weatherFilter;

      const qs = new URLSearchParams(params).toString();
      const response = await apiClient.get<PaginatedResponse<Island>>(`/islands?${qs}`);
      setIslands(response.data.data);
    } catch {
      toast({ title: "加载失败", description: "无法加载岛屿列表", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [search, weatherFilter]);

  useEffect(() => {
    fetchIslands();
  }, [fetchIslands]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">岛屿管理</h1>
        <p className="text-muted-foreground">查看和管理玩家岛屿</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索岛屿名称或用户ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={weatherFilter} onValueChange={(v) => setWeatherFilter(v as WeatherType | "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="天气筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部天气</SelectItem>
            {Object.entries(WEATHER_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Islands Grid */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : islands.length === 0 ? (
        <div className="text-center py-16">
          <Palmtree className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
          <p className="text-muted-foreground">暂无岛屿数据</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {islands.map((island) => (
            <Card key={island.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-sm">{island.name}</h3>
                  <Badge variant="outline">
                    {WEATHER_TYPE_LABELS[island.weatherType] || island.weatherType}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p>用户ID: {island.userId}</p>
                  <p>植物: {island.plants?.length ?? 0} | 精灵: {island.sprites?.length ?? 0} | 装饰: {island.decorations?.length ?? 0}</p>
                  <p>创建于: {formatDate(island.createdAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
