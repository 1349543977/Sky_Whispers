"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart } from "@/components/ui/chart";
import type { UserDetail as UserDetailType } from "@/types";
import { USER_STATUS_LABELS, USER_STATUS_COLORS } from "@/lib/constants";
import { formatNumber, formatDate, getInitials } from "@/lib/utils";
import { Shield, RotateCcw, Gift, Coins, TreePine, Sparkles, Heart } from "lucide-react";

interface UserDetailProps {
  user: UserDetailType | null;
  isLoading: boolean;
  onBan: (reason: string) => void;
  onUnban: () => void;
  onReset: () => void;
  onSendGift: () => void;
}

export function UserDetail({ user, isLoading, onBan, onUnban, onReset, onSendGift }: UserDetailProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">用户不存在</p>
      </div>
    );
  }

  const stepChartData = (user.stepRecords || []).map((record) => ({
    date: record.date,
    steps: record.steps,
  }));

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.nickname} />
              <AvatarFallback className="text-lg">{getInitials(user.nickname)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">{user.nickname}</h2>
                <Badge variant="outline" className={USER_STATUS_COLORS[user.status]}>
                  {USER_STATUS_LABELS[user.status]}
                </Badge>
                <Badge variant="secondary">Lv.{user.level}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">ID: {user.id}</p>
              <p className="text-sm text-muted-foreground">注册于 {formatDate(user.createdAt)}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {user.status === "banned" ? (
                <Button variant="outline" size="sm" onClick={onUnban} loading={false}>
                  <Shield className="h-4 w-4 mr-1" /> 解封
                </Button>
              ) : (
                <Button variant="destructive" size="sm" onClick={() => onBan("管理员封禁")}>
                  <Shield className="h-4 w-4 mr-1" /> 封禁
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onReset}>
                <RotateCcw className="h-4 w-4 mr-1" /> 重置
              </Button>
              <Button variant="outline" size="sm" onClick={onSendGift}>
                <Gift className="h-4 w-4 mr-1" /> 赠送
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
            <p className="text-2xl font-bold">{formatNumber(user.coins)}</p>
            <p className="text-xs text-muted-foreground">金币余额</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TreePine className="h-5 w-5 mx-auto text-green-500 mb-1" />
            <p className="text-2xl font-bold">{user.stats?.plantsGrown ?? 0}</p>
            <p className="text-xs text-muted-foreground">种植植物</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="h-5 w-5 mx-auto text-purple-500 mb-1" />
            <p className="text-2xl font-bold">{user.stats?.spritesCollected ?? 0}</p>
            <p className="text-xs text-muted-foreground">收集精灵</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-5 w-5 mx-auto text-pink-500 mb-1" />
            <p className="text-2xl font-bold">{user.stats?.giftsSent ?? 0}/{user.stats?.giftsReceived ?? 0}</p>
            <p className="text-xs text-muted-foreground">送出/收到礼物</p>
          </CardContent>
        </Card>
      </div>

      {/* Step Records Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">步数记录</CardTitle>
        </CardHeader>
        <CardContent>
          {stepChartData.length > 0 ? (
            <LineChart
              data={stepChartData}
              xKey="date"
              lines={[{ dataKey: "steps", color: "hsl(var(--primary))", name: "步数" }]}
              height={200}
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">暂无步数记录</p>
          )}
        </CardContent>
      </Card>

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">购买记录</CardTitle>
        </CardHeader>
        <CardContent>
          {user.purchaseHistory && user.purchaseHistory.length > 0 ? (
            <div className="space-y-3">
              {user.purchaseHistory.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{record.itemName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(record.purchasedAt)}</p>
                  </div>
                  <Badge variant="outline">
                    {record.currency === "coins" ? `${record.price} 金币` : `¥${record.price}`}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">暂无购买记录</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
