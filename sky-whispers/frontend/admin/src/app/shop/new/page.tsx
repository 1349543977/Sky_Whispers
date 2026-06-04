"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ItemForm, type ShopFormValues } from "@/components/shop/ItemForm";
import { shopService } from "@/services/shop";
import { toast } from "@/hooks/useToast";
import { Skeleton } from "@/components/ui/skeleton";

function ShopNewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get("edit");
  const [isLoading, setIsLoading] = React.useState(false);
  const [initialData, setInitialData] = React.useState<Partial<ShopFormValues> | undefined>(undefined);

  React.useEffect(() => {
    if (editId) {
      setIsLoading(true);
      shopService.getItemById(editId)
        .then((item) => {
          setInitialData({
            name: item.name,
            description: item.description,
            category: item.category,
            coinPrice: item.coinPrice,
            rmbPrice: item.rmbPrice,
            itemData: JSON.stringify(item.itemData, null, 2),
            isSeasonal: item.isSeasonal,
            seasonalStart: item.seasonalStart,
            seasonalEnd: item.seasonalEnd,
            status: item.status,
          });
        })
        .catch(() => {
          toast({ title: "加载失败", description: "无法加载商品信息", variant: "destructive" });
        })
        .finally(() => setIsLoading(false));
    }
  }, [editId]);

  const handleSubmit = async (data: ShopFormValues) => {
    setIsLoading(true);
    try {
      if (editId) {
        await shopService.updateItem(editId, data);
        toast({ title: "更新成功", description: `商品「${data.name}」已更新` });
      } else {
        await shopService.createItem(data);
        toast({ title: "创建成功", description: `商品「${data.name}」已创建` });
      }
      router.push("/shop");
    } catch {
      toast({ title: "操作失败", description: editId ? "更新商品失败" : "创建商品失败", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{editId ? "编辑商品" : "新建商品"}</h1>
        <p className="text-muted-foreground">{editId ? "修改商品信息" : "创建新的游戏商品"}</p>
      </div>

      <ItemForm initialData={initialData} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}

export default function ShopNewPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      }
    >
      <ShopNewContent />
    </Suspense>
  );
}
