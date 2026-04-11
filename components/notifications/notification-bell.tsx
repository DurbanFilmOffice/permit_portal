"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  MessageCircle,
  StickyNote,
  RefreshCw,
  Send,
  CheckCircle,
  XCircle,
  UserCheck,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Role } from "@/lib/validations/roles";

// ─── Types ────────────────────────────────────────────────

type NotificationType =
  | "comment_added"
  | "note_added"
  | "status_changed"
  | "permit_submitted"
  | "permit_approved"
  | "permit_rejected"
  | "user_assigned";

interface PortalNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  permitId: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  role: Role;
}

// ─── Helpers ──────────────────────────────────────────────

function getTypeIcon(type: NotificationType) {
  const size = 16;
  switch (type) {
    case "comment_added":
      return <MessageCircle size={size} className="text-muted-foreground" />;
    case "note_added":
      return <StickyNote size={size} className="text-muted-foreground" />;
    case "status_changed":
      return <RefreshCw size={size} className="text-muted-foreground" />;
    case "permit_submitted":
      return <Send size={size} className="text-muted-foreground" />;
    case "permit_approved":
      return <CheckCircle size={size} className="text-green-600" />;
    case "permit_rejected":
      return <XCircle size={size} className="text-red-600" />;
    case "user_assigned":
      return <UserCheck size={size} className="text-muted-foreground" />;
  }
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatCount(n: number): string {
  return n > 99 ? "99+" : String(n);
}

// ─── Component ────────────────────────────────────────────

export function NotificationBell({ role }: NotificationBellProps) {
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  // ── Fetch unread count ──────────────────────────────────

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      const data = (await res.json()) as { count: number };
      setUnreadCount(data.count);
    } catch {
      // Silently fail — badge just won't update
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // ── Fetch notification list ─────────────────────────────

  const fetchNotifications = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/notifications");
      const data = (await res.json()) as {
        notifications: PortalNotification[];
      };
      setNotifications(data.notifications);
    } catch {
      // Silently fail — list stays empty
    } finally {
      setLoadingList(false);
    }
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) fetchNotifications();
  };

  // ── Mark all read ───────────────────────────────────────

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  // ── Click individual notification ───────────────────────

  const handleNotificationClick = async (notification: PortalNotification) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: notification.id }),
    });

    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
    );
    if (!notification.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    if (notification.permitId) {
      const isInternal = role !== "applicant";
      const url = isInternal
        ? `/admin/applications/${notification.permitId}`
        : `/applications/${notification.permitId}`;
      router.push(url);
      setOpen(false);
    }
  };

  // ── Derived ─────────────────────────────────────────────

  const hasUnread = unreadCount > 0;
  const allRead = notifications.every((n) => n.isRead);

  // ── Render ──────────────────────────────────────────────

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 rounded-full bg-red-500 text-white text-sm font-medium px-1">
              {formatCount(unreadCount)}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <span className="text-lg font-semibold">Notifications</span>
          {!allRead && (
            <Button
              variant="ghost"
              size="sm"
              className="text-sm h-auto py-1"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        <Separator />

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {loadingList && (
            <div className="p-3 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-start">
                  <Skeleton className="h-4 w-4 rounded-full mt-1 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingList && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <BellOff size={24} />
              <span className="text-base">No notifications yet</span>
            </div>
          )}

          {!loadingList &&
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="flex items-start gap-3 p-3 hover:bg-accent cursor-pointer"
              >
                <div className="mt-0.5 shrink-0">
                  {getTypeIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium leading-snug">
                    {notification.title}
                  </p>
                  {notification.body && (
                    <p className="text-sm text-muted-foreground truncate">
                      {notification.body}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>

                {!notification.isRead && (
                  <div className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
