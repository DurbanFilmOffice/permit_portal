import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const permitStatusEnum = pgEnum("permit_status", [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "returned",
]);

export const permits = pgTable(
  "permits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    status: text("status").notNull().default("draft"),
    // Validated by permitStatusSchema in permit-status.ts
    // NOT a pgEnum — statuses can change without migrations
    projectName: text("project_name").notNull(),
    siteAddress: text("site_address").notNull(),
    description: text("description"),
    formData: jsonb("form_data"), // all dynamic form fields — never add individual columns
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("permits_user_id_idx").on(table.userId),
    statusIdx: index("permits_status_idx").on(table.status),
    createdAtIdx: index("permits_created_at_idx").on(table.createdAt),
    userStatusIdx: index("permits_user_id_status_idx").on(
      table.userId,
      table.status,
    ),
  }),
);

// Always export inferred types — never hand-write them
export type Permit = typeof permits.$inferSelect;
export type NewPermit = typeof permits.$inferInsert;
