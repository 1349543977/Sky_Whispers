"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart } from "@/components/ui/chart";
import type { RevenueBreakdown } from "@/types";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";

interface RevenueBreakdownProps {
  data: RevenueBreakdown | null;
  isLoading: boolean;
}

export function RevenueBreakdownCard({ data, isLoading }: RevenueBreakdownProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6"><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
        <Card>
          <CardContent className="p-6"><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  const pieData = data
    ? [
        { name: "广告收入", value: data.adRevenue, color: "hsl(var(--warning))" },
        { name: "内购收入", value: data.iapRevenue, color: "hsl(var(--primary))" },
      ]
    : [];

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">收入构成</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart data={pieData} height={300} />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCurrency(data?.arpu ?? 0)}</p>
              <p className="text-xs text-muted-foreground">ARPU</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCurrency(data?.arppu ?? 0)}</p>
              <p className="text-xs text-muted-foreground">ARPPU</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">热销商品</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.topSellingItems && data.topSellingItems.length > 0 ? (
            <div className="space-y-3">
              {data.topSellingItems.slice(0, 5).map((item, i) => (
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
  );
}
