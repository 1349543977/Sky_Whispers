"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ShopItem } from "@/types";
import { SHOP_CATEGORY_LABELS, SHOP_STATUS_LABELS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { Coins, CreditCard, Calendar, Tag } from "lucide-react";

interface ItemPreviewProps {
  item: Partial<ShopItem>;
}

export function ItemPreview({ item }: ItemPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">商品预览</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Image placeholder */}
          <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
            {item.imageData ? (
              <img src={item.imageData} alt={item.name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="text-center text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">暂无图片</p>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{item.name || "商品名称"}</h3>
            <p className="text-sm text-muted-foreground">{item.description || "商品描述"}</p>
          </div>

          {/* Category & Status */}
          <div className="flex gap-2">
            <Badge variant="outline">
              {item.category ? SHOP_CATEGORY_LABELS[item.category] : "分类"}
            </Badge>
            <Badge variant={item.status === "available" ? "success" : "secondary"}>
              {item.status ? SHOP_STATUS_LABELS[item.status] : "状态"}
            </Badge>
            {item.isSeasonal && <Badge variant="warning">限定</Badge>}
          </div>

          {/* Prices */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{item.coinPrice ? formatNumber(item.coinPrice) : 0} 金币</span>
            </div>
            {item.rmbPrice && (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <span className="font-medium">¥{item.rmbPrice}</span>
              </div>
            )}
          </div>

          {/* Seasonal dates */}
          {item.isSeasonal && (item.seasonalStart || item.seasonalEnd) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {item.seasonalStart || "???"} ~ {item.seasonalEnd || "???"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
