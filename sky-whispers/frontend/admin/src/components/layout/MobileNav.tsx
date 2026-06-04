"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Palmtree,
  ShoppingBag,
  CalendarDays,
  BarChart3,
  Ticket,
  Settings,
  CloudSun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Palmtree,
  ShoppingBag,
  CalendarDays,
  BarChart3,
  Ticket,
  Settings,
};

const navItems = [
  { title: "仪表盘", href: "/", icon: "LayoutDashboard" },
  { title: "用户管理", href: "/users", icon: "Users" },
  { title: "岛屿管理", href: "/islands", icon: "Palmtree" },
  { title: "商店管理", href: "/shop", icon: "ShoppingBag" },
  { title: "活动管理", href: "/events", icon: "CalendarDays" },
  { title: "数据分析", href: "/analytics", icon: "BarChart3" },
  { title: "赛季通行证", href: "/season-pass", icon: "Ticket" },
  { title: "系统设置", href: "/settings", icon: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = React.useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="打开导航菜单">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-3">
            <CloudSun className="h-7 w-7 text-primary" />
            <div className="flex flex-col text-left">
              <span className="font-bold text-base">{APP_NAME}</span>
              <span className="text-xs text-muted-foreground font-normal">Admin Dashboard</span>
            </div>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col py-4 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
