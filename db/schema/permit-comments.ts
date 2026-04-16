import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { permits } from "./permits";
import { users } from "./users";

// APPLICANT-FACING COMMENT THREAD ONLY.
// This table is for communication between applicants and permit officers.
// external_user cannot read or write this table — enforced in comments.service.ts.
// This is a completely separate table from application_notes (internal notes).
// Never merge these tables or add an is_internal flag to this table.
//
// Soft delete: set deleted_at = NOW() instead of DELETE.
// Only admin/super_admin can view and restore deleted items.
// All normal queries filter WHERE deleted_at IS NULL.

export const permitComments = pgTable(
  "permit_comments",
  {
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
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    permitIdIdx: index("permit_comments_permit_id_idx").on(table.permitId),
  }),
);

export type PermitComment = typeof permitComments.$inferSelect;
export type NewPermitComment = typeof permitComments.$inferInsert;