import { pgTable, uuid, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { permits } from "./permits";
import { workflowTemplates } from "./workflow-templates";

export const workflowInstanceStatusEnum = pgEnum("workflow_instance_status", [
  "pending",
  "in_progress",
  "completed",
  "rejected",
  "returned",
]);

export const workflowInstances = pgTable("workflow_instances", {
  id: uuid("id").primaryKey().defaultRandom(),
  permitId: uuid("permit_id")
    .notNull()
    .references(() => permits.id, { onDelete: "cascade" }),
  workflowTemplateId: uuid("workflow_template_id")
    .notNull()
    .references(() => workflowTemplates.id),
  currentStepOrder: integer("current_step_order").notNull().default(1),
  status: workflowInstanceStatusEnum("status").notNull().default("pending"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type WorkflowInstance = typeof workflowInstances.$inferSelect;
export type NewWorkflowInstance = typeof workflowInstances.$inferInsert;
