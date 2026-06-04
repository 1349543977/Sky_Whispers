// ============================================================
// Sky Whispers Admin - Analytics Service
// ============================================================

import { apiClient } from "./api";
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
import { buildQueryString } from "@/lib/utils";

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>("/analytics/dashboard");
    return response.data;
  },

  async getActiveUsers(period: ActiveUsersData["period"]): Promise<ActiveUsersData> {
    const qs = buildQueryString({ period });
    const response = await apiClient.get<ActiveUsersData>(`/analytics/active-users${qs}`);
    return response.data;
  },

  async getRevenueData(days: number = 30): Promise<RevenueData[]> {
    const qs = buildQueryString({ days });
    const response = await apiClient.get<RevenueData[]>(`/analytics/revenue${qs}`);
    return response.data;
  },

  async getWeatherDistribution(): Promise<WeatherDistributionData[]> {
    const response = await apiClient.get<WeatherDistributionData[]>("/analytics/weather-distribution");
    return response.data;
  },

  async getRetentionData(): Promise<RetentionData[]> {
    const response = await apiClient.get<RetentionData[]>("/analytics/retention");
    return response.data;
  },

  async getEngagementMetrics(): Promise<EngagementMetrics> {
    const response = await apiClient.get<EngagementMetrics>("/analytics/engagement");
    return response.data;
  },

  async getRevenueBreakdown(): Promise<RevenueBreakdown> {
    const response = await apiClient.get<RevenueBreakdown>("/analytics/revenue-breakdown");
    return response.data;
  },

  async getRecentActivities(limit: number = 20): Promise<RecentActivity[]> {
    const qs = buildQueryString({ limit });
    const response = await apiClient.get<RecentActivity[]>(`/analytics/activities${qs}`);
    return response.data;
  },
};
