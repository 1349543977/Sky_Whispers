"use client";

import React from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ShopItem, ShopItemCategory, ShopItemStatus } from "@/types";
import { SHOP_CATEGORY_LABELS, SHOP_STATUS_LABELS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { Plus, ArrowUpDown } from "lucide-react";

interface ItemTableProps {
  items: ShopItem[];
  isLoading: boolean;
  categoryFilter: ShopItemCategory | "all";
  onCategoryChange: (category: ShopItemCategory | "all") => void;
  onToggleStatus: (id: string, status: ShopItemStatus) => void;
}

export function ItemTable({ items, isLoading, categoryFilter, onCategoryChange, onToggleStatus }: ItemTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns: ColumnDef<ShopItem>[] = React.useMemo(() => [
    {
      accessorKey: "name",
      header: "商品名称",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.description?.slice(0, 40)}</p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "分类",
      cell: ({ row }) => (
        <Badge variant="outline">{SHOP_CATEGORY_LABELS[row.getValue("category") as string] || row.getValue("category")}</Badge>
      ),
    },
    {
      accessorKey: "coinPrice",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          金币价格 <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span>{formatNumber(row.getValue("coinPrice") as number)}</span>,
    },
    {
      accessorKey: "rmbPrice",
      header: "人民币价格",
      cell: ({ row }) => {
        const price = row.getValue("rmbPrice") as number | null;
        return <span>{price ? `¥${price}` : "-"}</span>;
      },
    },
    {
      accessorKey: "isSeasonal",
      header: "季节限定",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isSeasonal") ? "warning" : "secondary"}>
          {row.getValue("isSeasonal") ? "限定" : "常驻"}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const status = row.getValue("status") as ShopItemStatus;
        return <Badge variant={status === "available" ? "success" : status === "hidden" ? "secondary" : "destructive"}>{SHOP_STATUS_LABELS[status]}</Badge>;
      },
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const item = row.original;
        const isAvailable = item.status === "available";
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isAvailable}
              onCheckedChange={(checked) =>
                onToggleStatus(item.id, checked ? "available" : "unavailable")
              }
              aria-label="切换上架状态"
            />
            <Link href={`/shop/new?edit=${item.id}`}>
              <Button variant="ghost" size="sm">编辑</Button>
            </Link>
          </div>
        );
      },
    },
  ], [onToggleStatus]);

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={categoryFilter} onValueChange={(v) => onCategoryChange(v as ShopItemCategory | "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="分类筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {Object.entries(SHOP_CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Link href="/shop/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" /> 新建商品
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  暂无商品数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
