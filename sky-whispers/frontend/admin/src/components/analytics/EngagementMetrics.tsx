"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EngagementMetrics } from "@/types";
import { formatPercent } from "@/lib/utils";
import { TreePine, Sparkles, Gift, Footprints } from "lucide-react";

interface EngagementMetricsProps {
  metrics: EngagementMetrics | null;
  isLoading: boolean;
}

const metricCards = [
  { key: "avgPlantsPerUser" as const, title: "人均种植植物", icon: TreePine, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  { key: "avgSpritesCollected" as const, title: "人均收集精灵", icon: Sparkles, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  { key: "giftExchangeRate" as const, title: "礼物交换率", icon: Gift, color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/30", format: (v: number) => formatPercent(v) },
  { key: "stepConversionRate" as const, title: "步数转化率", icon: Footprints, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", format: (v: number) => formatPercent(v) },
];

export function EngagementMetricsCard({ metrics, isLoading }: EngagementMetricsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((card) => {
        const Icon = card.icon;
        const value = metrics?.[card.key] ?? 0;
        return (
          <Card key={card.key}>
            <CardContent className="p-6 text-center">
              <div className={`inline-flex p-2 rounded-full ${card.bg} mb-2`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold">
                {card.format ? card.format(value) : value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{card.title}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
