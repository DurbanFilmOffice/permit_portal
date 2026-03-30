import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { workflowTemplates } from "./workflow-templates";
import { users } from "./users";

export const workflowStepDefinitions = pgTable("workflow_step_definitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowTemplateId: uuid("workflow_template_id")
    .notNull()
    .references(() => workflowTemplates.id, { onDelete: "cascade" }),
  stepOrder: integer("step_order").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  // Plain text — does not have to match a value in ROLES.
  // Allows granular workflow roles beyond the system roles in roles.ts.
  assignedRole: text("assigned_role").notNull(),
  // null = any user with assigned_role can claim
  // set  = only this specific user can claim
  assignedUserId: uuid("assigned_user_id").references(() => users.id),
  isRequired: boolean("is_required").notNull().default(true),
  // { sla_hours, allow_parallel, escalate_after_hours }
  config: jsonb("config"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type WorkflowStepDefinition =
  typeof workflowStepDefinitions.$inferSelect;
export type NewWorkflowStepDefinition =
  typeof workflowStepDefinitions.$inferInsert;
