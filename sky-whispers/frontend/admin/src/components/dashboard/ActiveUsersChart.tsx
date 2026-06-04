"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActiveUsersData } from "@/types";
import { CHART_PERIODS } from "@/lib/constants";

interface ActiveUsersChartProps {
  data: ActiveUsersData | null;
  period: ActiveUsersData["period"];
  onPeriodChange: (period: ActiveUsersData["period"]) => void;
  isLoading: boolean;
}

export function ActiveUsersChart({ data, period, onPeriodChange, isLoading }: ActiveUsersChartProps) {
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

  const chartData = (data?.data || []).map((point) => ({
    date: point.date,
    dau: point.value,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">活跃用户趋势</CardTitle>
        <Tabs value={period} onValueChange={(v) => onPeriodChange(v as ActiveUsersData["period"])}>
          <TabsList className="h-8">
            {CHART_PERIODS.map((p) => (
              <TabsTrigger key={p.value} value={p.value} className="text-xs px-2 h-6">
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <LineChart
          data={chartData}
          xKey="date"
          lines={[{ dataKey: "dau", color: "hsl(var(--primary))", name: "DAU" }]}
          height={300}
        />
      </CardContent>
    </Card>
  );
}
