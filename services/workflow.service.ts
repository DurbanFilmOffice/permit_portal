import type { Role } from '@/lib/validations/roles'

export const workflowService = {
  async startWorkflow(permitId: string): Promise<void> {
    throw new Error('Workflow engine not yet implemented — see CLAUDE.md')
  },

  async claimStep(stepInstanceId: string, userId: string): Promise<void> {
    // Validates: step is awaiting, not claimed,
    // user.role matches step_definition.assigned_role
    throw new Error('Workflow engine not yet implemented — see CLAUDE.md')
  },

  async actionStep(
    stepInstanceId: string,
    userId: string,
    decision: 'approved' | 'returned',
    comment?: string
  ): Promise<void> {
    // 'returned' = send back to applicant for revision
    // 'rejected' is never a valid decision at step level
    throw new Error('Workflow engine not yet implemented — see CLAUDE.md')
  },

  async resubmit(permitId: string): Promise<void> {
    // Only valid when permit.status = 'returned'
    // Resets all step instances, restarts from step 1
    throw new Error('Workflow engine not yet implemented — see CLAUDE.md')
  },

  async getWorkflowStatus(permitId: string): Promise<unknown> {
    throw new Error('Workflow engine not yet implemented — see CLAUDE.md')
  },
}