"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/types";
import { formatNumber, formatPercent, formatDuration } from "@/lib/utils";
import { Users, Activity, DollarSign, Clock, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

const statCards = [
  {
    key: "totalUsers" as const,
    title: "总用户数",
    icon: Users,
    growthKey: "totalUsersGrowth" as const,
    format: (v: number) => formatNumber(v),
    gradientFrom: "var(--sky-primary-light)",
    gradientTo: "var(--sky-primary)",
    iconBg: "rgba(126, 181, 214, 0.12)",
    iconColor: "var(--sky-primary-dark)",
  },
  {
    key: "dau" as const,
    title: "日活跃用户",
    icon: Activity,
    growthKey: "dauGrowth" as const,
    format: (v: number) => formatNumber(v),
    gradientFrom: "var(--sky-secondary-light)",
    gradientTo: "var(--sky-secondary)",
    iconBg: "rgba(140, 198, 165, 0.12)",
    iconColor: "var(--sky-secondary)",
  },
  {
    key: "revenueToday" as const,
    title: "今日收入",
    icon: DollarSign,
    growthKey: "revenueGrowth" as const,
    format: (v: number) => `¥${formatNumber(v)}`,
    gradientFrom: "var(--sky-accent-light)",
    gradientTo: "var(--sky-accent)",
    iconBg: "rgba(242, 197, 124, 0.12)",
    iconColor: "var(--sky-accent)",
  },
  {
    key: "avgSessionDuration" as const,
    title: "平均会话时长",
    icon: Clock,
    growthKey: "avgSessionGrowth" as const,
    format: (v: number) => formatDuration(v),
    gradientFrom: "var(--sky-tertiary)",
    gradientTo: "#B87FA0",
    iconBg: "rgba(212, 160, 192, 0.12)",
    iconColor: "var(--sky-tertiary)",
  },
];

function AnimatedValue({ value, format }: { value: number; format: (v: number) => string }) {
  const [displayValue, setDisplayValue] = useState(format(value));
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      prevValueRef.current = value;
      setDisplayValue(format(value));
      return () => clearTimeout(timer);
    }
    setDisplayValue(format(value));
  }, [value, format]);

  return (
    <span className={isAnimating ? "animate-number-pop" : ""}>
      {displayValue}
    </span>
  );
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
      {statCards.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? 0;
        const growth = stats?.[card.growthKey] ?? 0;
        const isPositive = growth >= 0;

        return (
          <Card
            key={card.key}
            className="hover-lift overflow-hidden"
            style={{
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--sky-border)",
            }}
          >
            {/* Subtle gradient top border */}
            <div
              className="h-1"
              style={{
                background: `linear-gradient(90deg, ${card.gradientFrom}, ${card.gradientTo})`,
              }}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                className="text-sm font-medium"
                style={{ color: "var(--sky-text-secondary)" }}
              >
                {card.title}
              </CardTitle>
              <div
                className="p-2 rounded-[var(--radius-md)]"
                style={{ background: card.iconBg }}
              >
                <Icon className="h-4 w-4" style={{ color: card.iconColor }} />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--sky-text)" }}
              >
                <AnimatedValue value={value} format={card.format} />
              </div>
              <div className="flex items-center text-xs mt-1">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" style={{ color: "var(--sky-secondary)" }} />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" style={{ color: "var(--sky-accent)" }} />
                )}
                <span style={{ color: isPositive ? "var(--sky-secondary)" : "var(--sky-accent)" }}>
                  {formatPercent(growth)}
                </span>
                <span style={{ color: "var(--sky-text-secondary)" }} className="ml-1">vs 上期</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
