import { pgTable, uuid, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { workflowInstances } from "./workflow-instances";
import { workflowStepDefinitions } from "./workflow-step-definitions";
import { users } from "./users";

// IMPORTANT: No 'rejected' value in this enum.
// Step rejection always means 'returned to applicant'.
// 'rejected' only exists on permit.status and workflow_instance.status.
export const workflowStepStatusEnum = pgEnum("workflow_step_status", [
  "pending",
  "awaiting",
  "approved",
  "returned",
  "skipped",
]);

export const workflowStepInstances = pgTable("workflow_step_instances", {
  id: uuid("id").primaryKey().defaultRandom(),
  workflowInstanceId: uuid("workflow_instance_id")
    .notNull()
    .references(() => workflowInstances.id, { onDelete: "cascade" }),
  stepDefinitionId: uuid("step_definition_id")
    .notNull()
    .references(() => workflowStepDefinitions.id),
  // Copied from definition at creation for fast querying
  stepOrder: integer("step_order").notNull(),
  // null until a reviewer claims the step
  assignedTo: uuid("assigned_to").references(() => users.id),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  status: workflowStepStatusEnum("status").notNull().default("pending"),
  dueAt: timestamp("due_at", { withTimezone: true }),
  actionedAt: timestamp("actioned_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type WorkflowStepInstance = typeof workflowStepInstances.$inferSelect;
export type NewWorkflowStepInstance = typeof workflowStepInstances.$inferInsert;
