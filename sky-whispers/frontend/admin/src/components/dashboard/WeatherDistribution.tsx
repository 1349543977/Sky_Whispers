"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeatherDistributionData } from "@/types";
import { WEATHER_TYPE_LABELS, WEATHER_TYPE_COLORS } from "@/lib/constants";

interface WeatherDistributionProps {
  data: WeatherDistributionData[];
  isLoading: boolean;
}

export function WeatherDistribution({ data, isLoading }: WeatherDistributionProps) {
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
    name: WEATHER_TYPE_LABELS[item.weatherType] || item.weatherType,
    value: item.count,
    color: WEATHER_TYPE_COLORS[item.weatherType] || "#9ca3af",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">天气分布</CardTitle>
      </CardHeader>
      <CardContent>
        <PieChart data={chartData} height={300} innerRadius={60} />
      </CardContent>
    </Card>
  );
}
