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

## Drizzle schema pattern

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

## Comments service (permission enforcement)

```ts
// src/services/comments.service.ts
export const commentsService = {
  async addComment(permitId: string, authorId: string, authorRole: string, body: string) {
    const permit = await permitsRepository.findById(permitId)
    if (!permit) throw new Error('Permit not found')

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

---

## Notifications service

```ts
// src/services/notifications.service.ts
export const notificationsService = {

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

Services throw typed errors. Route handlers and Server Actions catch them.

```ts
// In a service
if (!permit) throw new Error('Permit not found')
if (permit.userId !== userId) throw new Error('Forbidden')

// In a Server Action
try {
  const result = await permitsService.submitPermit(userId, data)
  return { success: true, data: result }
} catch (err) {
  if (err instanceof Error) return { error: err.message }
  return { error: 'An unexpected error occurred' }
}

// In a Route Handler
try {
  const data = await permitsService.getUserPermits(userId)
  return Response.json(data)
} catch (err) {
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}
```