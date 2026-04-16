import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { permits } from "./permits";
import { users } from "./users";

export const permitStatusHistory = pgTable(
  "permit_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    permitId: uuid("permit_id")
      .notNull()
      .references(() => permits.id),
    changedBy: uuid("changed_by")
      .notNull()
      .references(() => users.id),
    // null on first status set
    oldStatus: text("old_status"),
    newStatus: text("new_status").notNull(),
    // Officer's optional decision reason.
    // This is NOT the applicant comment thread — status timeline only.
    comment: text("comment"),
    changedAt: timestamp("changed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    permitIdIdx: index("permit_status_history_permit_id_idx").on(
      table.permitId,
    ),
    changedByIdx: index("permit_status_history_changed_by_idx").on(
      table.changedBy,
    ),
  }),
);

export type PermitStatusHistory = typeof permitStatusHistory.$inferSelect;
export type NewPermitStatusHistory = typeof permitStatusHistory.$inferInsert;
