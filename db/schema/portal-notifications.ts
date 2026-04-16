import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { permits } from "./permits";

// comment_added = new applicant-facing comment (permit_comments)
// note_added    = new internal note (application_notes) — notifies assigned users only
// user_assigned = internal user assigned to a permit application
export const notificationTypeEnum = pgEnum("notification_type", [
  "comment_added",
  "note_added",
  "status_changed",
  "permit_submitted",
  "permit_approved",
  "permit_rejected",
  "user_assigned",
]);

export const portalNotifications = pgTable(
  "portal_notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    permitId: uuid("permit_id").references(() => permits.id, {
      onDelete: "set null",
    }),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIdx: index("portal_notifications_user_id_idx").on(table.userId),
    userReadIdx: index("portal_notifications_user_read_idx").on(
      table.userId,
      table.isRead,
    ),
    userCreatedIdx: index("portal_notifications_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
  }),
);

export type PortalNotification = typeof portalNotifications.$inferSelect;
export type NewPortalNotification = typeof portalNotifications.$inferInsert;