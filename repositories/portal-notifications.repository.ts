import { db } from "@/lib/db";
import { portalNotifications } from "@/db/schema/portal-notifications";
import { eq, and, desc, count } from "drizzle-orm";
import type { NewPortalNotification } from "@/db/schema/portal-notifications";

export const portalNotificationsRepository = {
  create: (data: NewPortalNotification) =>
    db
      .insert(portalNotifications)
      .values(data)
      .returning()
      .then((r) => r[0]),

  // Last 10 notifications for a user
  findByUser: (userId: string) =>
    db
      .select()
      .from(portalNotifications)
      .where(eq(portalNotifications.userId, userId))
      .orderBy(desc(portalNotifications.createdAt))
      .limit(10),

  // Count unread notifications
  countUnread: (userId: string) =>
    db
      .select({ count: count() })
      .from(portalNotifications)
      .where(
        and(
          eq(portalNotifications.userId, userId),
          eq(portalNotifications.isRead, false),
        ),
      )
      .then((r) => r[0]?.count ?? 0),

  // Mark one notification as read
  markRead: (id: string, userId: string) =>
    db
      .update(portalNotifications)
      .set({ isRead: true })
      .where(
        and(
          eq(portalNotifications.id, id),
          eq(portalNotifications.userId, userId),
        ),
      ),

  // Mark all as read for a user
  markAllRead: (userId: string) =>
    db
      .update(portalNotifications)
      .set({ isRead: true })
      .where(
        and(
          eq(portalNotifications.userId, userId),
          eq(portalNotifications.isRead, false),
        ),
      ),
};
