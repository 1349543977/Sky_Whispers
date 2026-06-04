"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/types";
import { formatNumber, formatPercent, formatDuration } from "@/lib/utils";
import { Users, Activity, DollarSign, Clock, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

const statCards = [
  {
    key: "totalUsers" as const,
    title: "总用户数",
    icon: Users,
    growthKey: "totalUsersGrowth" as const,
    format: (v: number) => formatNumber(v),
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    key: "dau" as const,
    title: "日活跃用户",
    icon: Activity,
    growthKey: "dauGrowth" as const,
    format: (v: number) => formatNumber(v),
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    key: "revenueToday" as const,
    title: "今日收入",
    icon: DollarSign,
    growthKey: "revenueGrowth" as const,
    format: (v: number) => `¥${formatNumber(v)}`,
    color: "text-purple-600",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    key: "avgSessionDuration" as const,
    title: "平均会话时长",
    icon: Clock,
    growthKey: "avgSessionGrowth" as const,
    format: (v: number) => formatDuration(v),
    color: "text-orange-600",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
];

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? 0;
        const growth = stats?.[card.growthKey] ?? 0;
        const isPositive = growth >= 0;

        return (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`p-2 rounded-md ${card.bg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.format(value)}</div>
              <div className="flex items-center text-xs mt-1">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={isPositive ? "text-green-600" : "text-red-600"}>
                  {formatPercent(growth)}
                </span>
                <span className="text-muted-foreground ml-1">vs 上期</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
