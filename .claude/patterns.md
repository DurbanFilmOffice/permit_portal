# patterns.md — Permit Portal

> Code patterns and examples. Read when writing services, repositories, or schema files.
> Rules in `CLAUDE.md` always take precedence.

---

## Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Files | kebab-case | `permits.service.ts` |
| Components | PascalCase | `ApplicationsTable.tsx` |
| Functions / variables | camelCase | `getUserPermits` |
| DB columns | snake_case | `project_name` |
| Drizzle TS fields | camelCase (auto-mapped) | `projectName` |
| Zod schemas | camelCase + Schema suffix | `permitFormSchema` |
| Env vars | SCREAMING_SNAKE_CASE | `DATABASE_URL` |

---

## DB connection

```ts
// src/lib/db.ts — only file that knows the DB host
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/db/schema'

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
```

---

## Roles — single source of truth

```ts
// src/lib/validations/roles.ts
import { z } from 'zod'

export const ROLES = [
  'applicant',
  'external_user',
  'permit_officer',
  'permit_admin',
  'admin',
  'super_admin',
] as const

export type Role = typeof ROLES[number]
export const roleSchema = z.enum(ROLES)

// Internal roles — can be in permit_assignments, can write internal notes
export const INTERNAL_ROLES: Role[] = [
  'external_user', 'permit_officer', 'permit_admin', 'admin', 'super_admin',
]

// Can read and write the applicant-facing comment thread
export const canAccessApplicantThread = (role: Role) =>
  ['permit_officer', 'permit_admin', 'admin', 'super_admin'].includes(role)

// Can approve or reject a permit
export const canApproveReject = (role: Role) =>
  ['permit_admin', 'admin', 'super_admin'].includes(role)

export const isInternalRole = (role: Role) => INTERNAL_ROLES.includes(role)
```

The `users.role` DB column is plain `text` — not a pgEnum.
Validation happens here at the application layer.
To add a new role: add it to ROLES array + update ROLE_CONFIG in roles.ts. No migration needed.
See the Role strategy section in `.claude/architecture.md` for the full checklist.

Key services that use role checks:
  comments.service.ts  → canAccessApplicantThread() blocks external_user
  notes.service.ts     → isInternalRole() blocks applicant
  permits.service.ts   → canApproveReject() blocks permit_officer and below
  users.service.ts     → admin/super_admin only for role changes and deactivation
  assignments.service.ts → isInternalRole() prevents applicant assignment

---

```ts
// src/db/schema/permits.ts
import { pgTable, uuid, text, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users'

export const permitStatusEnum = pgEnum('permit_status', [
  'draft', 'submitted', 'under_review', 'approved', 'rejected', 'returned',
])

export const permits = pgTable('permits', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id),
  status:      permitStatusEnum('status').notNull().default('draft'),
  projectName: text('project_name').notNull(),
  siteAddress: text('site_address').notNull(),
  description: text('description'),
  formData:    jsonb('form_data'),   // all dynamic form fields — never add individual columns
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Always export inferred types — never hand-write them
export type Permit    = typeof permits.$inferSelect
export type NewPermit = typeof permits.$inferInsert
```

---

## Soft delete pattern

permit_comments and application_notes use soft deletes.
Never use db.delete() on these tables. Always set deleted_at.

```ts
// WRONG — hard delete, never do this on comments or notes
delete: (id: string) =>
  db.delete(permitComments).where(eq(permitComments.id, id)),

// CORRECT — soft delete
delete: (id: string) =>
  db.update(permitComments)
    .set({ deletedAt: new Date() })
    .where(eq(permitComments.id, id)),

// CORRECT — normal query always filters deleted rows
findByPermit: (permitId: string) =>
  db.select()
    .from(permitComments)
    .where(
      and(
        eq(permitComments.permitId, permitId),
        isNull(permitComments.deletedAt)   ← always include this
      )
    ),

// CORRECT — admin-only query includes deleted rows
findByPermitWithDeleted: (permitId: string) =>
  db.select()
    .from(permitComments)
    .where(
      and(
        eq(permitComments.permitId, permitId),
        isNotNull(permitComments.deletedAt)
      )
    ),

// CORRECT — restore
restore: (id: string) =>
  db.update(permitComments)
    .set({ deletedAt: null })
    .where(eq(permitComments.id, id))
    .returning()
    .then(r => r[0]),
```

## Repository pattern

```ts
// src/repositories/permits.repository.ts
import { db } from '@/lib/db'
import { permits } from '@/db/schema/permits'
import { eq, desc } from 'drizzle-orm'
import type { Permit, NewPermit } from '@/db/schema/permits'

export const permitsRepository = {
  findByUser: (userId: string) =>
    db.select().from(permits)
      .where(eq(permits.userId, userId))
      .orderBy(desc(permits.createdAt)),

  findById: (id: string) =>
    db.select().from(permits)
      .where(eq(permits.id, id))
      .limit(1)
      .then(r => r[0] ?? null),

  create: (data: NewPermit) =>
    db.insert(permits).values(data).returning().then(r => r[0]),

  update: (id: string, data: Partial<NewPermit>) =>
    db.update(permits)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(permits.id, id))
      .returning()
      .then(r => r[0]),
}
```

---

## Service pattern

```ts
// src/services/permits.service.ts
import { permitsRepository } from '@/repositories/permits.repository'
import { permitStatusHistoryRepository } from '@/repositories/permit-status-history.repository'
import { notificationsService } from '@/services/notifications.service'

export const permitsService = {
  async approvePermit(permitId: string, officerId: string, reason?: string) {
    const permit = await permitsRepository.findById(permitId)
    if (!permit) throw new Error('Permit not found')
    if (['approved', 'rejected'].includes(permit.status)) throw new Error('Permit already closed')

    const updated = await permitsRepository.update(permitId, { status: 'approved' })
    await permitStatusHistoryRepository.create({
      permitId, changedBy: officerId,
      oldStatus: permit.status, newStatus: 'approved', comment: reason ?? null,
    })
    await notificationsService.onStatusChanged(updated, reason)
    return updated
  },
  // rejectPermit: identical pattern with status: 'rejected'
}
```

---

## Comments service (applicant-facing thread)

```ts
// src/services/comments.service.ts
// Applicant-facing thread only — external_user cannot access this service
export const commentsService = {
  async addComment(permitId: string, authorId: string, authorRole: Role, body: string) {
    // external_user cannot write to the applicant thread
    if (authorRole === 'external_user') {
      throw new Error('External users cannot post to the applicant comment thread')
    }

    const permit = await permitsRepository.findById(permitId)
    if (!permit) throw new Error('Permit not found')

    // Applicants can only comment on active applications
    const applicantStatuses = ['submitted', 'under_review', 'returned']
    if (authorRole === 'applicant' && !applicantStatuses.includes(permit.status)) {
      throw new Error('Comments are closed for this application')
    }

    const comment = await commentsRepository.create({ permitId, authorId, body })
    await notificationsService.onCommentAdded(permit, comment, authorRole)
    return comment
  },
}
```

## Notes service (internal notes — never visible to applicants)

```ts
// src/services/notes.service.ts
// Internal notes only — applicants are never allowed here
export const notesService = {
  async addNote(permitId: string, authorId: string, authorRole: Role, body: string) {
    // Hard block — applicants can never write internal notes
    if (authorRole === 'applicant') {
      throw new Error('Applicants cannot add internal notes')
    }

    const permit = await permitsRepository.findById(permitId)
    if (!permit) throw new Error('Permit not found')

    const note = await notesRepository.create({ permitId, authorId, body })

    // Notify all assigned users on this permit except the author
    const assigned = await assignmentsRepository.findByPermit(permitId)
    const recipients = assigned.filter(a => a.userId !== authorId)
    await notificationsService.onNoteAdded(permit, note, recipients)

    return note
  },

  // ALWAYS filter by role before returning — never call findByPermit directly in a component
  async getNotesForPermit(permitId: string, requestingRole: Role) {
    if (requestingRole === 'applicant') {
      throw new Error('Applicants cannot view internal notes')
    }
    return notesRepository.findByPermit(permitId)
  },
}
```

## Assignments service

```ts
// src/services/assignments.service.ts
export const assignmentsService = {
  async assignUser(permitId: string, userId: string, assignedBy: string, note?: string) {
    // Prevent assigning applicants to permits
    const user = await usersRepository.findById(userId)
    if (!user) throw new Error('User not found')
    if (user.role === 'applicant') {
      throw new Error('Applicants cannot be assigned to permits')
    }

    return assignmentsRepository.create({ permitId, userId, assignedBy, note })
  },

  async unassignUser(permitId: string, userId: string) {
    return assignmentsRepository.delete({ permitId, userId })
  },

  // "My Applications" for internal users
  async getAssignedPermits(userId: string) {
    return assignmentsRepository.findPermitsByUser(userId)
  },
}
```

---

## Notifications service

```ts
// src/services/notifications.service.ts
export const notificationsService = {

  // Triggered when a user is assigned to a permit
  // Fire-and-forget — notification failure never blocks assignment
  // assignmentsService calls this after assignmentsRepository.create()
  async onUserAssigned(permit, assignedUser, assignedBy, note?) {
    // Creates portal notification (type: user_assigned)
    // Sends AssignmentNotificationEmail to assignedUser.email
    // portalUrl = /admin/applications/[permitId]
  },

  // Triggered when an internal note is added
  // Notifies all assigned users on the permit except the note author
  async onNoteAdded(permit: Permit, note: ApplicationNote, recipients: Assignment[]) {
    await Promise.allSettled(recipients.map(r => Promise.all([
      portalNotificationsRepository.create({
        userId: r.userId,
        type: 'note_added',
        title: 'New internal note on a permit application',
        body: permit.projectName,
        permitId: permit.id,
      }),
      sendEmail({
        to: r.user.email,
        template: <InternalNoteEmail permit={permit} note={note} />,
      }),
    ])))
  },

  async onStatusChanged(permit: Permit, reason?: string) {
    const type = permit.status === 'approved' ? 'permit_approved' : 'permit_rejected'
    await portalNotificationsRepository.create({
      userId: permit.userId, type,
      title: `Your application has been ${permit.status}`,
      body: reason ?? null, permitId: permit.id,
    })
    const applicant = await usersRepository.findById(permit.userId)
    await sendEmail({
      to: applicant.email,
      template: <PermitStatusUpdateEmail permit={permit} reason={reason} />,
    })
  },

  async onCommentAdded(permit: Permit, comment: Comment, commenterRole: string) {
    if (commenterRole === 'applicant') {
      // Notify active officers
      const officers = await notificationRecipientsRepository.findActive()
      await Promise.allSettled(officers.map(o => Promise.all([
        portalNotificationsRepository.create({
          userId: o.userId, type: 'comment_added',
          title: 'New comment on a permit application',
          body: permit.projectName, permitId: permit.id,
        }),
        sendEmail({ to: o.email, template: <PermitCommentEmail permit={permit} comment={comment} /> }),
      ])))
    } else {
      // Notify applicant
      await portalNotificationsRepository.create({
        userId: permit.userId, type: 'comment_added',
        title: 'A permit officer commented on your application',
        body: permit.projectName, permitId: permit.id,
      })
      const applicant = await usersRepository.findById(permit.userId)
      await sendEmail({ to: applicant.email, template: <PermitCommentEmail permit={permit} comment={comment} /> })
    }
  },
}
```

---

## Workflow service stubs (do not implement until requirements confirmed)

```ts
// src/services/workflow.service.ts
export const workflowService = {
  async startWorkflow(permitId: string): Promise<void> {
    throw new Error('Workflow engine not yet implemented — see CLAUDE.md')
  },
  async claimStep(stepInstanceId: string, userId: string): Promise<void> {
    // Sets assigned_to = userId, claimed_at = now()
    // Validates: step is awaiting, not claimed, user has the correct role
    throw new Error('Workflow engine not yet implemented — see CLAUDE.md')
  },
  async actionStep(stepInstanceId: string, userId: string, decision: 'approved' | 'returned', comment?: string): Promise<void> {
    // 'returned' always means return to applicant — never 'rejected' at step level
    throw new Error('Workflow engine not yet implemented — see CLAUDE.md')
  },
  async resubmit(permitId: string): Promise<void> {
    // Only valid when permit.status = 'returned'
    // Resets all step instances, restarts from step 1
    throw new Error('Workflow engine not yet implemented — see CLAUDE.md')
  },
  async getWorkflowStatus(permitId: string) {
    throw new Error('Workflow engine not yet implemented — see CLAUDE.md')
  },
}
```

---

## Server vs client component rules

Default to Server Components. Add `'use client'` only when the component needs:
- `useState` / `useEffect` / other hooks
- Browser APIs
- Event listeners
- shadcn components that require client context (DropdownMenu, Popover, Sheet, etc.)

```ts
// Server Component (no directive needed)
export default async function ApplicationsPage() {
  const session = await auth()
  const permits = await permitsService.getUserPermits(session.user.id)
  return <ApplicationsTable permits={permits} />
}

// Client Component
'use client'
export function ApplicationsTable({ permits }: { permits: Permit[] }) {
  // TanStack Table, sorting, filtering etc.
}
```

---

## Server Actions pattern (prefer over API routes for mutations)

```ts
// src/app/(applicant)/applications/actions.ts
'use server'
import { auth } from '@/lib/auth'
import { permitsService } from '@/services/permits.service'
import { permitFormSchema } from '@/lib/validations/permit-form.schema'

export async function submitPermitAction(formData: unknown) {
  const session = await auth()
  if (!session) throw new Error('Unauthorised')

  const parsed = permitFormSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const permit = await permitsService.submitPermit(session.user.id, parsed.data)
  return { success: true, permitId: permit.id }
}
```

---

## Migrations workflow

```bash
bun db:generate   # generates .sql migration file from schema changes
bun db:migrate    # applies pending migrations to DB
bun db:studio     # opens Drizzle Studio GUI in browser
```

After any schema file change, always run `generate` then review the generated SQL before running `migrate`.

---

## Error handling convention

Services throw typed errors. Server Actions catch them and return
a consistent ActionResponse shape. Never throw unhandled to the client.

### ActionResponse — single source of truth for action returns

```ts
// src/lib/utils/action-response.ts
export type ActionResponse<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

export function actionSuccess<T>(data?: T): ActionResponse<T>
export function actionError(err: unknown, fallback?: string): ActionResponse
```

### Server Action pattern (always use this)

```ts
// In a Server Action — always return ActionResponse, never throw
export async function someAction(input: unknown) {
  const session = await auth()
  if (!session?.user) return actionError('Unauthorised')

  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }

  try {
    const result = await someService.doThing(parsed.data)
    return actionSuccess(result)
  } catch (err) {
    return actionError(err)
  }
}
```

### Displaying errors in components

```ts
// Form-level error — use FormError component
import { FormError } from '@/components/shared/form-error'
import { FormSuccess } from '@/components/shared/form-success'

const [error, setError] = useState<string>()
const [success, setSuccess] = useState<string>()

const onSubmit = async (values) => {
  const result = await someAction(values)
  if (!result.success) {
    setError(result.error)
  } else {
    setSuccess('Changes saved successfully')
  }
}

// In JSX
<FormError message={error} />
<FormSuccess message={success} />
<form>...</form>
```

### Toast pattern (non-form mutations)

```ts
// For actions outside forms (assign, delete, toggle etc.)
const result = await someAction(id)
if (!result.success) {
  toast.error(result.error)
} else {
  toast.success('Done')
  router.refresh()
}
```

### Error boundaries

Every route segment has an error.tsx that catches unhandled throws:
  src/app/error.tsx                          ← root fallback
  src/app/(applicant)/error.tsx              ← applicant section
  src/app/(admin)/error.tsx                  ← admin section

error.tsx MUST be 'use client'. Receives { error, reset } props.
reset() retries the failed render.

### Services still throw — that is correct

Services throw typed Error objects. The boundary is at the
Server Action layer — actions catch and convert to ActionResponse.
Never catch errors in services unless you are handling a specific
known case.

```ts
// In a service — throw is correct here
if (!permit) throw new Error('Permit not found')
if (permit.userId !== userId) throw new Error('Forbidden')

// In a Route Handler
try {
  const data = await permitsService.getUserPermits(userId)
  return Response.json(data)
} catch (err) {
  return Response.json(
    { error: 'Internal server error' }, { status: 500 }
  )
}
```