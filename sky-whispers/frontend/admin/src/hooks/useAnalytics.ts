// ============================================================
// Sky Whispers Admin - Analytics Hook
// ============================================================

import { useState, useCallback, useEffect } from "react";
import type {
  DashboardStats,
  ActiveUsersData,
  RevenueData,
  WeatherDistributionData,
  RetentionData,
  EngagementMetrics,
  RevenueBreakdown,
  RecentActivity,
} from "@/types";
import { analyticsService } from "@/services/analytics";

interface UseAnalyticsReturn {
  stats: DashboardStats | null;
  activeUsers: ActiveUsersData | null;
  revenueData: RevenueData[];
  weatherDistribution: WeatherDistributionData[];
  retentionData: RetentionData[];
  engagementMetrics: EngagementMetrics | null;
  revenueBreakdown: RevenueBreakdown | null;
  recentActivities: RecentActivity[];
  isLoading: boolean;
  error: string | null;
  period: ActiveUsersData["period"];
  setPeriod: (period: ActiveUsersData["period"]) => void;
  refreshAll: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUsersData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [weatherDistribution, setWeatherDistribution] = useState<WeatherDistributionData[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionData[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<ActiveUsersData["period"]>("7d");

  const fetchDashboardStats = useCallback(async () => {
    try {
      const data = await analyticsService.getDashboardStats();
      setStats(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "获取仪表盘数据失败";
      setError(message);
    }
  }, []);

  const fetchActiveUsers = useCallback(async (p: ActiveUsersData["period"]) => {
    try {
      const data = await analyticsService.getActiveUsers(p);
      setActiveUsers(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "获取活跃用户数据失败";
      setError(message);
    }
  }, []);

  const fetchRevenueData = useCallback(async () => {
    try {
      const data = await analyticsService.getRevenueData(30);
      setRevenueData(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "获取收入数据失败";
      setError(message);
    }
  }, []);

  const fetchWeatherDistribution = useCallback(async () => {
    try {
      const data = await analyticsService.getWeatherDistribution();
      setWeatherDistribution(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "获取天气分布数据失败";
      setError(message);
    }
  }, []);

  const fetchRetentionData = useCallback(async () => {
    try {
      const data = await analyticsService.getRetentionData();
      setRetentionData(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "获取留存数据失败";
      setError(message);
    }
  }, []);

  const fetchEngagementMetrics = useCallback(async () => {
    try {
      const data = await analyticsService.getEngagementMetrics();
      setEngagementMetrics(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "获取参与度数据失败";
      setError(message);
    }
  }, []);

  const fetchRevenueBreakdown = useCallback(async () => {
    try {
      const data = await analyticsService.getRevenueBreakdown();
      setRevenueBreakdown(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "获取收入明细失败";
      setError(message);
    }
  }, []);

  const fetchRecentActivities = useCallback(async () => {
    try {
      const data = await analyticsService.getRecentActivities(20);
      setRecentActivities(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "获取最近活动失败";
      setError(message);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await Promise.allSettled([
      fetchDashboardStats(),
      fetchActiveUsers(period),
      fetchRevenueData(),
      fetchWeatherDistribution(),
      fetchRecentActivities(),
    ]);
    setIsLoading(false);
  }, [period, fetchDashboardStats, fetchActiveUsers, fetchRevenueData, fetchWeatherDistribution, fetchRecentActivities]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    fetchActiveUsers(period);
  }, [period, fetchActiveUsers]);

  return {
    stats,
    activeUsers,
    revenueData,
    weatherDistribution,
    retentionData,
    engagementMetrics,
    revenueBreakdown,
    recentActivities,
    isLoading,
    error,
    period,
    setPeriod,
    refreshAll,
  };
}

interface UseAnalyticsDetailReturn {
  retentionData: RetentionData[];
  engagementMetrics: EngagementMetrics | null;
  revenueBreakdown: RevenueBreakdown | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAnalyticsDetail(): UseAnalyticsDetailReturn {
  const [retentionData, setRetentionData] = useState<RetentionData[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await Promise.allSettled([
      analyticsService.getRetentionData().then(setRetentionData).catch(() => {}),
      analyticsService.getEngagementMetrics().then(setEngagementMetrics).catch(() => {}),
      analyticsService.getRevenueBreakdown().then(setRevenueBreakdown).catch(() => {}),
    ]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { retentionData, engagementMetrics, revenueBreakdown, isLoading, error, refresh };
}
