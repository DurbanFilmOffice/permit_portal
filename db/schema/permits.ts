import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// permit_status uses pgEnum — it is a closed system that changes only via
// deliberate migration. This is intentional. users.role does NOT use pgEnum.
export const permitStatusEnum = pgEnum("permit_status", [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "returned",
]);

export type PermitStatus = (typeof permitStatusEnum.enumValues)[number];

export const permits = pgTable("permits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  permitType: text("permit_type").notNull(),
  status: permitStatusEnum("status").notNull().default("draft"),
  projectName: text("project_name").notNull(),
  siteAddress: text("site_address").notNull(),
  description: text("description"),
  // ALL dynamic permit form fields live here.
  // Never add individual form field columns to this table.
  formData: jsonb("form_data"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Permit = typeof permits.$inferSelect;
export type NewPermit = typeof permits.$inferInsert;
