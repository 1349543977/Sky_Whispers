"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/services/api";
import { toast } from "@/hooks/useToast";
import type { SystemSettings, WeatherType } from "@/types";
import { WEATHER_TYPE_LABELS } from "@/lib/constants";
import { Save, RefreshCw, Cloud, MessageSquare, Bell, Wrench, Database } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [weatherProvider, setWeatherProvider] = useState("");
  const [weatherApiKey, setWeatherApiKey] = useState("");
  const [weatherRefreshInterval, setWeatherRefreshInterval] = useState(30);
  const [fallbackWeather, setFallbackWeather] = useState<WeatherType>("sunny");
  const [wechatAppId, setWechatAppId] = useState("");
  const [wechatAppSecret, setWechatAppSecret] = useState("");
  const [wechatMchId, setWechatMchId] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<SystemSettings>("/settings");
      const data = response.data;
      setSettings(data);
      setWeatherProvider(data.weatherApi.provider);
      setWeatherApiKey(data.weatherApi.apiKey);
      setWeatherRefreshInterval(data.weatherApi.refreshInterval);
      setFallbackWeather(data.weatherApi.fallbackWeather);
      setWechatAppId(data.wechatApp.appId);
      setWechatAppSecret(data.wechatApp.appSecret);
      setWechatMchId(data.wechatApp.mchId);
      setMaintenanceMode(data.maintenanceMode);
    } catch {
      toast({ title: "加载失败", description: "无法加载系统设置", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put("/settings", {
        weatherApi: { provider: weatherProvider, apiKey: weatherApiKey, refreshInterval: weatherRefreshInterval, fallbackWeather },
        wechatApp: { appId: wechatAppId, appSecret: wechatAppSecret, mchId: wechatMchId },
        maintenanceMode,
      });
      toast({ title: "保存成功", description: "系统设置已更新" });
    } catch {
      toast({ title: "保存失败", description: "无法保存设置", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm("确定要清除所有缓存吗？")) return;
    try {
      await apiClient.post("/settings/clear-cache");
      toast({ title: "缓存已清除" });
      fetchSettings();
    } catch {
      toast({ title: "操作失败", description: "清除缓存失败", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">系统设置</h1>
        <p className="text-muted-foreground">管理系统配置和参数</p>
      </div>

      {/* Weather API */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Cloud className="h-5 w-5" /> 天气 API 配置
          </CardTitle>
          <CardDescription>配置天气数据源和刷新策略</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weather-provider">API 提供商</Label>
              <Input id="weather-provider" value={weatherProvider} onChange={(e) => setWeatherProvider(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weather-api-key">API Key</Label>
              <Input id="weather-api-key" type="password" value={weatherApiKey} onChange={(e) => setWeatherApiKey(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weather-refresh">刷新间隔 (分钟)</Label>
              <Input id="weather-refresh" type="number" value={weatherRefreshInterval} onChange={(e) => setWeatherRefreshInterval(Number(e.target.value))} min={5} />
            </div>
            <div className="space-y-2">
              <Label>默认天气</Label>
              <Select value={fallbackWeather} onValueChange={(v) => setFallbackWeather(v as WeatherType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(WEATHER_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WeChat */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> 微信小程序配置
          </CardTitle>
          <CardDescription>微信应用和支付配置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wx-appid">App ID</Label>
              <Input id="wx-appid" value={wechatAppId} onChange={(e) => setWechatAppId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wx-secret">App Secret</Label>
              <Input id="wx-secret" type="password" value={wechatAppSecret} onChange={(e) => setWechatAppSecret(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wx-mchid">商户号</Label>
            <Input id="wx-mchid" value={wechatMchId} onChange={(e) => setWechatMchId(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Maintenance & Cache */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-5 w-5" /> 系统维护
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">维护模式</Label>
              <p className="text-sm text-muted-foreground">开启后用户将无法访问游戏</p>
            </div>
            <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">缓存管理</p>
                <p className="text-xs text-muted-foreground">
                  {settings?.cacheStatus ? `上次清除: ${settings.cacheStatus.lastCleared} | 大小: ${settings.cacheStatus.totalSize}` : "暂无缓存信息"}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearCache}>
              <RefreshCw className="h-4 w-4 mr-1" /> 清除缓存
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} className="min-w-[120px]">
          <Save className="h-4 w-4 mr-1" /> 保存设置
        </Button>
      </div>
    </div>
  );
}
