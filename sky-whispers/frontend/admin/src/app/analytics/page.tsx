"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, BarChart, PieChart } from "@/components/ui/chart";
import { useAnalyticsDetail } from "@/hooks/useAnalytics";
import { formatNumber, formatCurrency, formatPercent } from "@/lib/utils";
import { WEATHER_TYPE_LABELS, WEATHER_TYPE_COLORS } from "@/lib/constants";

export default function AnalyticsPage() {
  const { retentionData, engagementMetrics, revenueBreakdown, isLoading } = useAnalyticsDetail();

  // Prepare retention heatmap data
  const retentionColumns = ["day0", "day1", "day3", "day7", "day14", "day30"];
  const retentionHeaders = ["第0天", "第1天", "第3天", "第7天", "第14天", "第30天"];

  // Prepare revenue chart data
  const revenueChartData = revenueBreakdown
    ? [
        { name: "广告收入", value: revenueBreakdown.adRevenue, color: "hsl(var(--warning))" },
        { name: "内购收入", value: revenueBreakdown.iapRevenue, color: "hsl(var(--primary))" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">数据分析</h1>
        <p className="text-muted-foreground">深入分析用户行为和收入数据</p>
      </div>

      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList>
          <TabsTrigger value="engagement">参与度</TabsTrigger>
          <TabsTrigger value="retention">留存率</TabsTrigger>
          <TabsTrigger value="revenue">收入分析</TabsTrigger>
        </TabsList>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-3xl font-bold">{engagementMetrics?.avgPlantsPerUser ?? 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">人均种植植物</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-3xl font-bold">{engagementMetrics?.avgSpritesCollected ?? 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">人均收集精灵</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-3xl font-bold">{formatPercent(engagementMetrics?.giftExchangeRate ?? 0)}</p>
                    <p className="text-sm text-muted-foreground mt-1">礼物交换率</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-3xl font-bold">{formatPercent(engagementMetrics?.stepConversionRate ?? 0)}</p>
                    <p className="text-sm text-muted-foreground mt-1">步数转化率</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">留存率热力图</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : retentionData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left p-2 font-medium text-muted-foreground">注册日期</th>
                        {retentionHeaders.map((h) => (
                          <th key={h} className="text-center p-2 font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {retentionData.map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2 font-medium">{row.cohort}</td>
                          {retentionColumns.map((col) => {
                            const value = row[col as keyof typeof row] as number;
                            const day0 = row.day0 || 1;
                            const pct = (value / day0) * 100;
                            const opacity = Math.min(pct / 100, 1);
                            return (
                              <td
                                key={col}
                                className="text-center p-2"
                                style={{ backgroundColor: `rgba(59, 130, 246, ${opacity * 0.3})` }}
                              >
                                {pct.toFixed(1)}%
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">暂无留存数据</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-2xl font-bold">{formatCurrency(revenueBreakdown?.arpu ?? 0)}</p>
                    <p className="text-sm text-muted-foreground mt-1">ARPU</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-2xl font-bold">{formatCurrency(revenueBreakdown?.arppu ?? 0)}</p>
                    <p className="text-sm text-muted-foreground mt-1">ARPPU</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-2xl font-bold">{formatPercent(revenueBreakdown?.seasonPassConversionRate ?? 0)}</p>
                    <p className="text-sm text-muted-foreground mt-1">赛季通行证转化率</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-2xl font-bold">{formatCurrency((revenueBreakdown?.adRevenue ?? 0) + (revenueBreakdown?.iapRevenue ?? 0))}</p>
                    <p className="text-sm text-muted-foreground mt-1">总收入</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">收入构成</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PieChart data={revenueChartData} height={300} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">热销商品 TOP 5</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {revenueBreakdown?.topSellingItems && revenueBreakdown.topSellingItems.length > 0 ? (
                      <div className="space-y-3">
                        {revenueBreakdown.topSellingItems.map((item, i) => (
                          <div key={item.itemId} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                              <span className="text-sm font-medium">{item.itemName}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatCurrency(item.revenue)}</p>
                              <p className="text-xs text-muted-foreground">售出 {formatNumber(item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">暂无销售数据</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
