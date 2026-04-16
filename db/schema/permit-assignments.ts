import {
  pgTable,
  uuid,
  text,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { permits } from "./permits";
import { users } from "./users";

// INTERNAL USERS ONLY.
// This table maps internal users to permits they are assigned to.
// Applicants are NEVER in this table — enforced in assignments.service.ts.
// This table drives:
//   1. "My Applications" for internal users: WHERE user_id = currentUserId
//   2. Internal note notifications: query this table to find recipients
//   3. Workflow step claiming eligibility

export const permitAssignments = pgTable(
  "permit_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    permitId: uuid("permit_id")
      .notNull()
      .references(() => permits.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assignedBy: uuid("assigned_by")
      .notNull()
      .references(() => users.id),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // Optional reason for assignment
    note: text("note"),
  },
  (t) => ({
    // One assignment row per user per permit
    uniqUserPermit: unique().on(t.permitId, t.userId),
    userIdIdx: index("permit_assignments_user_id_idx").on(t.userId),
    permitIdIdx: index("permit_assignments_permit_id_idx").on(t.permitId),
  }),
);

export type PermitAssignment = typeof permitAssignments.$inferSelect;
export type NewPermitAssignment = typeof permitAssignments.$inferInsert;
