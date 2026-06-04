"use client";

import React from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ActiveUsersChart } from "@/components/dashboard/ActiveUsersChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { WeatherDistribution } from "@/components/dashboard/WeatherDistribution";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function DashboardPage() {
  const {
    stats,
    activeUsers,
    revenueData,
    weatherDistribution,
    recentActivities,
    isLoading,
    period,
    setPeriod,
  } = useAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground">云端气象局运营数据概览</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} isLoading={isLoading} />

      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <ActiveUsersChart
          data={activeUsers}
          period={period}
          onPeriodChange={setPeriod}
          isLoading={isLoading}
        />
        <RevenueChart data={revenueData} isLoading={isLoading} />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <WeatherDistribution data={weatherDistribution} isLoading={isLoading} />
        <RecentActivity activities={recentActivities} isLoading={isLoading} />
      </div>
    </div>
  );
}
