import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const notificationRecipients = pgTable("notification_recipients", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  name: text("name"),
  // Informational label only — not validated against ROLES
  role: text("role"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type NotificationRecipient = typeof notificationRecipients.$inferSelect;
export type NewNotificationRecipient =
  typeof notificationRecipients.$inferInsert;
