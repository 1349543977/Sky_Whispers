"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  title: string;
  href?: string;
}

const routeMap: Record<string, string> = {
  "": "仪表盘",
  users: "用户管理",
  islands: "岛屿管理",
  shop: "商店管理",
  new: "新建商品",
  events: "活动管理",
  analytics: "数据分析",
  "season-pass": "赛季通行证",
  settings: "系统设置",
  login: "登录",
};

interface BreadcrumbProps {
  className?: string;
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const pathname = usePathname() ?? "/";
  const segments = pathname.split("/").filter(Boolean);

  const items: BreadcrumbItem[] = [
    { title: "首页", href: "/" },
    ...segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const title = routeMap[segment] || segment;
      const isLast = index === segments.length - 1;
      return { title, href: isLast ? undefined : href };
    }),
  ];

  // Remove duplicate if first segment is also "首页"
  if (items.length > 1 && items[1]?.title === "首页") {
    items.splice(1, 1);
  }

  return (
    <nav className={cn("flex items-center text-sm text-muted-foreground", className)} aria-label="面包屑导航">
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.title}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.title}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
