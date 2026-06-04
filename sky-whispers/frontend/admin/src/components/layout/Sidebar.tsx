"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Palmtree,
  ShoppingBag,
  CalendarDays,
  BarChart3,
  Ticket,
  Settings,
  ChevronLeft,
  ChevronRight,
  CloudSun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

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

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Logo */}
        <div className={cn("flex items-center h-16 border-b px-4", collapsed ? "justify-center" : "gap-3")}>
          <CloudSun className="h-8 w-8 text-primary shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">{APP_NAME}</span>
              <span className="text-xs text-muted-foreground">Admin Dashboard</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const active = isActive(item.href);

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              );
            }

            return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full rounded-lg py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
