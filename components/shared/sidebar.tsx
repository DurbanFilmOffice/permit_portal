"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileStack,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  UserCircle,
  X,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROLE_CONFIG } from "@/lib/validations/roles";
import type { NavItem, SessionUser } from "@/types";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/shared/sign-out-button";

const ICON_MAP: Record<string, LucideIcon> = {
  Bell,
  FileStack,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  UserCircle,
};

type SidebarProps = {
  navItems: NavItem[];
  user: SessionUser;
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
};

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (parts.length === 1 ? first : first + last).toUpperCase();
}

function SidebarContent({
  navItems,
  user,
  isCollapsed,
  onToggle,
  onClose,
  isMobile,
}: {
  navItems: NavItem[];
  user: SessionUser;
  isCollapsed: boolean;
  onToggle: () => void;
  onClose?: () => void;
  isMobile: boolean;
}) {
  const pathname = usePathname();
  const expanded = isMobile || !isCollapsed;
  const roleConfig = ROLE_CONFIG[user.role];
  const initials = getInitials(user.name);

  return (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div
        className={cn(
          "flex items-center h-14 px-3 border-b border-border shrink-0",
          expanded ? "justify-between" : "justify-center",
        )}
      >
        {expanded ? (
          <>
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold text-foreground"
            >
              <Building2 className="h-5 w-5 shrink-0" />
              <span>Permit Portal</span>
            </Link>
            {isMobile ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Nav items */}
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {navItems
            .filter((item) => item.roles.includes(user.role))
            .map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = ICON_MAP[item.icon];

              if (!Icon) return null;

              if (!expanded) {
                return (
                  <TooltipProvider key={item.href} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center justify-center h-9 w-9 rounded-md mx-auto transition-colors",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 h-9 rounded-md text-base transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="shrink-0 pb-2">
        <Separator className="mb-2" />
        <div className={cn("px-2", expanded ? "" : "flex justify-center")}>
          {expanded ? (
            <div className="flex items-center gap-3 px-3 py-2 rounded-md">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-medium truncate">
                  {user.name}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-1.5 py-0 w-fit mt-0.5 border-0",
                    roleConfig.badgeClass,
                  )}
                >
                  {roleConfig.label}
                </Badge>
              </div>
            </div>
          ) : (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center py-2 cursor-default">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">{user.name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Sign out */}
        <div className={cn("px-2 mt-1", !expanded && "flex justify-center")}>
          {expanded ? (
            <SignOutButton
              showIcon
              showLabel
              className="w-full justify-start text-base"
            />
          ) : (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SignOutButton showIcon showLabel={false} />
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}

export function Sidebar({
  navItems,
  user,
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border shrink-0",
          "transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-60",
        )}
      >
        <SidebarContent
          navItems={navItems}
          user={user}
          isCollapsed={isCollapsed}
          onToggle={onToggle}
          isMobile={false}
        />
      </aside>

      {/* Mobile sidebar — Sheet drawer */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
        <SheetContent
          side="left"
          className="w-[280px] p-0 bg-sidebar border-sidebar-border"
        >
          <SidebarContent
            navItems={navItems}
            user={user}
            isCollapsed={false}
            onToggle={onToggle}
            onClose={onMobileClose}
            isMobile={true}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
