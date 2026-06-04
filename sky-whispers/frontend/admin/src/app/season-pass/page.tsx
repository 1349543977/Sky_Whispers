"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { BarChart } from "@/components/ui/chart";
import { apiClient } from "@/services/api";
import { toast } from "@/hooks/useToast";
import type { SeasonPass } from "@/types";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import { Ticket, Crown, Users, TrendingUp } from "lucide-react";

export default function SeasonPassPage() {
  const [seasonPass, setSeasonPass] = useState<SeasonPass | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSeasonPass = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<SeasonPass>("/season-pass/current");
      setSeasonPass(response.data);
    } catch {
      toast({ title: "加载失败", description: "无法加载赛季通行证数据", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeasonPass();
  }, [fetchSeasonPass]);

  // Prepare tier distribution chart data
  const tierChartData = seasonPass
    ? Array.from({ length: Math.max(seasonPass.freeTiers.length, seasonPass.premiumTiers.length) }, (_, i) => ({
        level: `Tier ${i + 1}`,
        免费奖励: seasonPass.freeTiers[i] ? 1 : 0,
        高级奖励: seasonPass.premiumTiers[i] ? 1 : 0,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">赛季通行证</h1>
        <p className="text-muted-foreground">管理赛季通行证和奖励配置</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : seasonPass ? (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Ticket className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{seasonPass.name}</p>
                <p className="text-sm text-muted-foreground">{seasonPass.season}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{seasonPass.totalSubscribers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">总订阅者</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Crown className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-2xl font-bold">{seasonPass.premiumSubscribers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">高级订阅者</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold">{formatPercent(seasonPass.conversionRate)}</p>
                <p className="text-sm text-muted-foreground">高级转化率</p>
              </CardContent>
            </Card>
          </div>

          {/* Season Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">赛季信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">开始日期</p>
                  <p className="font-medium">{formatDate(seasonPass.startDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">结束日期</p>
                  <p className="font-medium">{formatDate(seasonPass.endDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">高级价格</p>
                  <p className="font-medium">{formatCurrency(seasonPass.premiumPrice)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">奖励层级</p>
                  <p className="font-medium">{seasonPass.freeTiers.length} 免费 / {seasonPass.premiumTiers.length} 高级</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tier Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">奖励层级配置</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={tierChartData}
                xKey="level"
                bars={[
                  { dataKey: "免费奖励", color: "hsl(var(--secondary))" },
                  { dataKey: "高级奖励", color: "hsl(var(--primary))" },
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Ticket className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
            <p className="text-muted-foreground">暂无活跃的赛季通行证</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
