"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart } from "@/components/ui/chart";
import type { RetentionData } from "@/types";

interface RetentionChartProps {
  data: RetentionData[];
  isLoading: boolean;
}

export function RetentionChart({ data, isLoading }: RetentionChartProps) {
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

  const chartData = data.map((row) => ({
    cohort: row.cohort,
    day1: row.day1,
    day7: row.day7,
    day30: row.day30,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">留存率趋势</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart
          data={chartData}
          xKey="cohort"
          bars={[
            { dataKey: "day1", color: "hsl(var(--primary))", name: "次日留存" },
            { dataKey: "day7", color: "hsl(var(--secondary))", name: "7日留存" },
            { dataKey: "day30", color: "hsl(var(--accent))", name: "30日留存" },
          ]}
          height={300}
        />
      </CardContent>
    </Card>
  );
}
