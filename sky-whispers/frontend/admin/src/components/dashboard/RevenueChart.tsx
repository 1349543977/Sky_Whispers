"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { RevenueData } from "@/types";

interface RevenueChartProps {
  data: RevenueData[];
  isLoading: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    date: item.date,
    adRevenue: item.adRevenue,
    iapRevenue: item.iapRevenue,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">收入趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart
          data={chartData}
          xKey="date"
          bars={[
            { dataKey: "adRevenue", color: "hsl(var(--warning))", name: "广告收入" },
            { dataKey: "iapRevenue", color: "hsl(var(--primary))", name: "内购收入" },
          ]}
          height={300}
          stacked
        />
      </CardContent>
    </Card>
  );
}
