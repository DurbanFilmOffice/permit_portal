import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { permits } from "./permits";
import { users } from "./users";

// ============================================================
// INTERNAL NOTES — NEVER VISIBLE TO APPLICANTS.
// ============================================================
// This table is completely separate from permit_comments.
// permit_comments = applicant-facing thread.
// application_notes = internal staff notes only.
// Never merge these tables. Never add an is_internal flag to permit_comments.
// Never query this table in any applicant-facing context.
// Enforced at both service layer (notes.service.ts) and repository layer.
//
// On insert: notify all users in permit_assignments for this permit
// except the author — handled in notes.service.ts, not here.
// ============================================================

export const applicationNotes = pgTable("application_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  permitId: uuid("permit_id")
    .notNull()
    .references(() => permits.id, { onDelete: "cascade" }),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ApplicationNote = typeof applicationNotes.$inferSelect;
export type NewApplicationNote = typeof applicationNotes.$inferInsert;
