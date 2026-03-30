import { pgTable, uuid, text, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core'
import { workflowStepInstances } from './workflow-step-instances'
import { users } from './users'

// ============================================================
// INSERT ONLY — rows in this table are NEVER updated after insert.
// This table is an immutable audit log of all workflow decisions.
// Do not add UPDATE or DELETE operations anywhere in the codebase.
// ============================================================

// No 'rejected' value — same reason as workflow_step_instances.
// Step rejection always means 'returned to applicant'.
export const workflowDecisionTypeEnum = pgEnum('workflow_decision_type', [
  'approved',
  'returned',
])

export const workflowDecisions = pgTable('workflow_decisions', {
  id:             uuid('id').primaryKey().defaultRandom(),
  stepInstanceId: uuid('step_instance_id').notNull().references(() => workflowStepInstances.id),
  decidedBy:      uuid('decided_by').notNull().references(() => users.id),
  decision:       workflowDecisionTypeEnum('decision').notNull(),
  comment:        text('comment'),
  decidedAt:      timestamp('decided_at', { withTimezone: true }).notNull().defaultNow(),
  // Future use: { ip_address, user_agent, time_spent_seconds }
  metadata:       jsonb('metadata'),
})

export type WorkflowDecision    = typeof workflowDecisions.$inferSelect
export type NewWorkflowDecision = typeof workflowDecisions.$inferInsert