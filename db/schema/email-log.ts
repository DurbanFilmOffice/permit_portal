import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { permits } from "./permits";

export const emailStatusEnum = pgEnum("email_status", [
  "pending",
  "sent",
  "failed",
]);

export const emailLog = pgTable("email_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  permitId: uuid("permit_id").references(() => permits.id, {
    onDelete: "set null",
  }),
  recipientEmail: text("recipient_email").notNull(),
  templateName: text("template_name").notNull(),
  status: emailStatusEnum("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

export type EmailLog = typeof emailLog.$inferSelect;
export type NewEmailLog = typeof emailLog.$inferInsert;
