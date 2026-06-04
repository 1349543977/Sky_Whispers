"use client";

import React from "react";
import { ItemTable } from "@/components/shop/ItemTable";
import { useShop } from "@/hooks/useShop";
import type { ShopItemCategory } from "@/types";

export default function ShopPage() {
  const { items, isLoading, filters, setFilters, toggleStatus } = useShop();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">商店管理</h1>
        <p className="text-muted-foreground">管理游戏内商品和道具</p>
      </div>

      <ItemTable
        items={items}
        isLoading={isLoading}
        categoryFilter={filters.category || "all"}
        onCategoryChange={(category) => setFilters({ category })}
        onToggleStatus={toggleStatus}
      />
    </div>
  );
}
