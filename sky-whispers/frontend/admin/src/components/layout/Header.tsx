"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Bell, Moon, Search, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { MobileNav } from "@/components/layout/MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { ADMIN_ROLE_LABELS } from "@/lib/constants";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { admin, logout } = useAuth();

  return (
    <header
      className={`flex items-center h-16 border-b px-4 md:px-6 gap-4 ${className || ""}`}
      style={{
        background: "rgba(250, 251, 253, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: "var(--sky-border)",
      }}
    >
      {/* Mobile nav */}
      <MobileNav />

      {/* Breadcrumb */}
      <Breadcrumb className="hidden md:flex" />

      {/* Search */}
      <div className="flex-1 max-w-md ml-auto md:ml-0">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200"
            style={{ color: "var(--sky-text-secondary)" }}
          />
          <Input
            placeholder="搜索用户、商品、活动..."
            className="pl-9 border-0 transition-all duration-200 focus-visible:ring-2"
            style={{
              background: "var(--sky-surface-warm)",
              borderRadius: "var(--radius-lg)",
              focusVisibleRingColor: "var(--sky-primary)",
            }}
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="切换主题"
          className="relative overflow-hidden transition-all duration-300"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-500 ease-in-out dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-500 ease-in-out dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" aria-label="通知">
          <Bell className="h-5 w-5" />
          <span
            className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{
              background: "var(--sky-accent)",
              color: "#FFFFFF",
            }}
          >
            3
          </span>
        </Button>

        {/* Admin avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={admin?.avatar} alt={admin?.username || "Admin"} />
                <AvatarFallback>{admin ? getInitials(admin.username) : "AD"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{admin?.username || "管理员"}</p>
                <p className="text-xs leading-none" style={{ color: "var(--sky-text-secondary)" }}>
                  {admin ? ADMIN_ROLE_LABELS[admin.role] || admin.role : ""}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>个人资料</DropdownMenuItem>
            <DropdownMenuItem>修改密码</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
