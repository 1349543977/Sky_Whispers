"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { ShopItemCategory, ShopItemStatus } from "@/types";
import { SHOP_CATEGORY_LABELS } from "@/lib/constants";

const shopItemSchema = z.object({
  name: z.string().min(1, "商品名称不能为空").max(50, "名称不能超过50字"),
  description: z.string().max(500, "描述不能超过500字").optional(),
  category: z.enum(["plant", "sprite", "decoration", "weather_theme", "gift", "bundle"]),
  coinPrice: z.number().min(0, "金币价格不能为负数"),
  rmbPrice: z.number().min(0).nullable().optional(),
  itemData: z.string().min(1, "物品数据不能为空"),
  isSeasonal: z.boolean().default(false),
  seasonalStart: z.string().optional(),
  seasonalEnd: z.string().optional(),
  status: z.enum(["available", "unavailable", "hidden"]).default("available"),
});

type FormValues = z.infer<typeof shopItemSchema>;

interface ItemFormProps {
  initialData?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  isLoading: boolean;
}

export function ItemForm({ initialData, onSubmit, isLoading }: ItemFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(shopItemSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      category: initialData?.category ?? "plant",
      coinPrice: initialData?.coinPrice ?? 0,
      rmbPrice: initialData?.rmbPrice ?? null,
      itemData: initialData?.itemData ?? "{}",
      isSeasonal: initialData?.isSeasonal ?? false,
      seasonalStart: initialData?.seasonalStart ?? "",
      seasonalEnd: initialData?.seasonalEnd ?? "",
      status: initialData?.status ?? "available",
    },
  });

  const isSeasonal = watch("isSeasonal");
  const category = watch("category");
  const status = watch("status");

  const handleFormSubmit = (data: FormValues) => {
    return onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Left column - form fields */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">商品名称 *</Label>
              <Input id="name" {...register("name")} placeholder="输入商品名称" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">商品描述</Label>
              <textarea
                id="description"
                {...register("description")}
                placeholder="输入商品描述..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>分类 *</Label>
              <Select value={category} onValueChange={(v) => setValue("category", v as ShopItemCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SHOP_CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coinPrice">金币价格 *</Label>
                <Input
                  id="coinPrice"
                  type="number"
                  {...register("coinPrice", { valueAsNumber: true })}
                  min={0}
                />
                {errors.coinPrice && <p className="text-sm text-destructive">{errors.coinPrice.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rmbPrice">人民币价格</Label>
                <Input
                  id="rmbPrice"
                  type="number"
                  step="0.01"
                  {...register("rmbPrice", { valueAsNumber: true })}
                  placeholder="留空表示不可购买"
                  min={0}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={status} onValueChange={(v) => setValue("status", v as ShopItemStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">上架</SelectItem>
                  <SelectItem value="unavailable">下架</SelectItem>
                  <SelectItem value="hidden">隐藏</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={isSeasonal}
                onCheckedChange={(checked) => setValue("isSeasonal", checked)}
              />
              <Label>季节限定</Label>
            </div>

            {isSeasonal && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seasonalStart">开始日期</Label>
                  <Input id="seasonalStart" type="date" {...register("seasonalStart")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seasonalEnd">结束日期</Label>
                  <Input id="seasonalEnd" type="date" {...register("seasonalEnd")} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column - item data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">物品数据 (JSON)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemData">物品配置数据 *</Label>
              <textarea
                id="itemData"
                {...register("itemData")}
                className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder='{"type": "plant", "growthTime": 3600}'
                rows={12}
              />
              {errors.itemData && <p className="text-sm text-destructive">{errors.itemData.message}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          取消
        </Button>
        <Button type="submit" loading={isLoading}>
          {initialData ? "保存修改" : "创建商品"}
        </Button>
      </div>
    </form>
  );
}

export type { FormValues as ShopFormValues };
