import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const notificationRecipients = pgTable("notification_recipients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  email: text("email").notNull(),
  name: text("name"),
  role: text("role"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type NotificationRecipient = typeof notificationRecipients.$inferSelect;
export type NewNotificationRecipient =
  typeof notificationRecipients.$inferInsert;
