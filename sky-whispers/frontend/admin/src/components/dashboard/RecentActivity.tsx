"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { RecentActivity } from "@/types";
import { ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import { UserPlus, ShoppingBag, Gift, AlertTriangle, TrendingUp, CalendarDays } from "lucide-react";

interface RecentActivityProps {
  activities: RecentActivity[];
  isLoading: boolean;
}

const activityIcons: Record<string, React.ElementType> = {
  user_registration: UserPlus,
  purchase: ShoppingBag,
  gift_exchange: Gift,
  error_alert: AlertTriangle,
  level_up: TrendingUp,
  event_start: CalendarDays,
};

const activityBadgeVariants: Record<string, "default" | "secondary" | "destructive" | "warning" | "success"> = {
  user_registration: "success",
  purchase: "default",
  gift_exchange: "secondary",
  error_alert: "destructive",
  level_up: "warning",
  event_start: "default",
};

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">最近动态</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">暂无动态</p>
          ) : (
            activities.map((activity) => {
              const Icon = activityIcons[activity.type] || Activity;
              const badgeVariant = activityBadgeVariants[activity.type] || "default";

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-full bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
                        {ACTIVITY_TYPE_LABELS[activity.type] || activity.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground truncate">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Activity(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}
