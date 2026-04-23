# CLAUDE.md — Permit Portal

> Read this file first. For full detail see `.claude/architecture.md` and `.claude/patterns.md`.
> This file's rules take precedence over anything in `.claude/skills/`.

---

## What this is

A government-style permit application portal. Citizens submit permit applications. Permit officers review, approve, or return them. Admins manage users and configuration.

Reference: https://permits.durban.gov.za/projects

---

## Non-negotiable rules

These apply to every task, every file, every session. Never break them.

### Typography rules (apply to every component, every session)

These are hardcoded project standards. Never use smaller sizes than these.

| Element | Class | Never use |
|---|---|---|
| Body text, paragraphs | `text-base` | `text-sm` for reading text |
| Form labels | `text-base font-medium` | `text-sm` |
| Input / select / textarea | `text-base` | `text-sm` |
| Table cell content | `text-base` | `text-sm` |
| Table headers | `text-base font-medium` | `text-sm` |
| Placeholder text | inherits `text-base` from input | never override smaller |
| Nav item labels | `text-base` | `text-sm` |
| Page headings (h1) | `text-2xl font-semibold` | anything smaller |
| Section headings (h2) | `text-xl font-semibold` | anything smaller |
| Card headings | `text-lg font-semibold` | anything smaller |
| Helper / hint text | `text-sm text-muted-foreground` | `text-xs` |
| Badges / tags | `text-sm` | `text-xs` |
| Monospace (ref numbers) | `text-base font-mono` | `text-sm font-mono` |
| Button labels | `text-base` | `text-sm` |
| Dropdown menu items | `text-base` | `text-sm` |

**The rule in plain language:** `text-sm` is only allowed for
helper/hint text, badges, and timestamps. Everything a user reads,
fills in, or clicks must be `text-base` or larger.

When adding a new component or page, do not copy shadcn's default
`text-sm` — always upgrade to `text-base` unless it is a hint/badge.

1. **No DB calls outside repositories.** All Drizzle queries live in `src/repositories/` only.
2. **No business logic outside services.** Route handlers and components call services. Nothing else.
3. **No `@supabase/supabase-js` outside `src/lib/db.ts` and `src/lib/storage.ts`.** DB host is swappable — keep it that way.
4. **No form fields as DB columns.** All permit form fields go in `form_data jsonb`. See `.claude/architecture.md`.
5. **No `any`.** TypeScript strict mode throughout.
6. **No new packages without confirmation.** Use what is already installed.
7. **Workflow engine is not built yet.** `workflow.service.ts` is stubs only. Do not implement it.
8. **Permit form fields all go in `form_data` jsonb.** Never add individual form field columns.
   The only exceptions are `project_name` and `site_address` which are already proper columns.
   See `.claude/architecture.md` for the full field definitions and Zod schema shape.
9. **Every Server Action must return ActionResponse — never throw to the client.**
   Use `actionSuccess()` and `actionError()` from `src/lib/utils/action-response.ts`.
   Every action returns either `{ success: true, data? }` or `{ success: false, error: string }`.
   Wrap all logic in try/catch. No action ever throws unhandled.
10. **Use FormError and FormSuccess components for form-level feedback.**
    Import from `src/components/shared/form-error.tsx` and `src/components/shared/form-success.tsx`.
    Never build one-off Alert components for form errors — use these shared components.
11. **Internal notes are never visible to applicants.** `application_notes` is a separate table from `permit_comments`. Never query notes in any applicant-facing context. Enforced at service AND repository layer.
12. **`external_user` cannot access the applicant comment thread.** Block in `comments.service.ts` — not just in the UI.
13. **Applicants are never in `permit_assignments`.** The assignment table is for internal users only. Check role before inserting.
14. **Status change permissions are strictly enforced in `permits.service.ts`:**
    - `permit_officer` → can move to `in_review`, `in_progress`, `incomplete` only
    - `permit_admin`, `admin`, `super_admin` → can make all transitions
    - `external_user` → cannot change any status
    - `applicant` → cannot change status (resubmit handled separately via incomplete→submitted)
    Never check roles inline in components — always call `permits.service.ts`.
    permit_status is TEXT not pgEnum — validated by Zod, not the database.
15. **Soft deletes on permit_comments and application_notes.** Never hard DELETE these rows. Always set `deleted_at = NOW()`. Only `admin` and `super_admin` can view and restore deleted items. Enforced at service layer.

---

## Tech stack (quick reference)

| Concern | Choice |
|---|---|
| Framework | Next.js 16 — App Router |
| Runtime | Bun |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL via Drizzle ORM (hosted on Supabase — connection string only) |
| Auth | Auth.js v5 (next-auth) + DrizzleAdapter — no Supabase Auth, no Clerk |
| Forms | React Hook Form + Zod |
| Email | React Email + Resend (abstracted in `src/lib/email.ts`) |
| Tables | TanStack Table v8 + Nuqs for server-side pagination |
| Charts | Recharts |
| Linting | Biome (replaces ESLint + Prettier) |
| Testing | Vitest + Playwright |
| Deployment | Vercel (primary) |

---

## Roles

> Roles are stored as plain `text` in the DB — not a Postgres enum.
> New roles can be added by updating `src/lib/validations/roles.ts` only.
> No migrations needed. See `.claude/architecture.md` for the full checklist.

| Role | Scope | Key permissions |
|---|---|---|
| `applicant` | Own applications | Submit, edit (draft/submitted/returned), applicant thread, resubmit after returned |
| `external_user` | Assigned applications only | Internal notes only — no applicant thread access |
| `permit_officer` | All + assigned applications | Applicant thread, internal notes, assign users, review |
| `permit_admin` | All + assigned applications | Everything officer can + approve/reject + manage workflow |
| `admin` | Everything + users | Everything permit_admin can + user management |
| `super_admin` | Everything | Full access, terminal reject, delete any content, system config |

Key distinctions:
- `external_user` cannot read or write the applicant comment thread
- `permit_officer` cannot approve or reject — only `permit_admin` and above
- Assignment (`permit_assignments`) drives "My Applications" for internal roles
- Applicants are never in `permit_assignments`

---

## Status glossary

> permit_status is stored as plain TEXT — not a pgEnum.
> Same reason as roles — statuses evolve and text requires no migration to change.
> Validated at application layer via Zod only.

| Status | DB value | Meaning |
|---|---|---|
| `draft` | `draft` | Saved, not submitted |
| `submitted` | `submitted` | Submitted by applicant, awaiting first review |
| `in_review` | `in_review` | Officer actively reviewing |
| `in_progress` | `in_progress` | Active — work is underway |
| `incomplete` | `incomplete` | Replaces 'returned' — applicant edits and resubmits |
| `approved` | `approved` | Approved — terminal |
| `rejected` | `rejected` | Permanently closed — terminal |

`incomplete` ≠ `rejected`. Incomplete is fixable. Rejected is final.

### Status transition rules

| From | To | Who can trigger |
|---|---|---|
| `submitted` | `in_review` | permit_officer, permit_admin, admin, super_admin |
| `submitted` | `incomplete` | permit_officer, permit_admin, admin, super_admin |
| `submitted` | `approved` | permit_admin, admin, super_admin |
| `submitted` | `rejected` | permit_admin, admin, super_admin |
| `in_review` | `in_progress` | permit_officer, permit_admin, admin, super_admin |
| `in_review` | `incomplete` | permit_officer, permit_admin, admin, super_admin |
| `in_review` | `approved` | permit_admin, admin, super_admin |
| `in_review` | `rejected` | permit_admin, admin, super_admin |
| `in_progress` | `incomplete` | permit_officer, permit_admin, admin, super_admin |
| `in_progress` | `approved` | permit_admin, admin, super_admin |
| `in_progress` | `rejected` | permit_admin, admin, super_admin |
| `incomplete` | `submitted` | applicant resubmit only |
| `approved` | — | terminal, no further transitions |
| `rejected` | — | terminal, no further transitions |
| `draft` | `submitted` | applicant submit only |

`external_user` cannot trigger any status transition.
Every transition writes a row to `permit_status_history`.
Every transition notifies the applicant via email and portal notification.

---

## Route protection

```
/app/(auth)/        → public
/app/(applicant)/   → any authenticated user
/app/(admin)/       → external_user | permit_officer | permit_admin | admin | super_admin
/app/(admin)/users  → admin | super_admin
/app/(admin)/config → super_admin only
```
Note: proxy.ts (not middleware.ts) enforces these rules. Next.js 16 renamed middleware to proxy.

---

## Not built yet — do not implement

- Workflow engine (`workflow.service.ts` exists as stubs — see `.claude/architecture.md`)
- PDF export (planned — use @react-pdf/renderer, see `.claude/architecture.md` for full spec)
- Permit form is being rebuilt — new 7-step structure with file uploads. See architecture.md for full field definitions.
  Do not reference old field names (companyName, genre, locationName etc.) — use new names from architecture.md.
- Document upload (requirements changing — individual upload per document type coming later.
  Do not build any file upload UI or storage logic until explicitly instructed.)
- Auth.js proxy is fully configured (proxy.ts handles RBAC)
- Redis / job queue (synchronous email sends are fine for MVP)
- WebSocket notifications (polling every 30s is sufficient)
- Comment threading (flat list only)
- OAuth / social login
- Separate Express/Hono backend
- Analytics exports, i18n, mobile app

---

## Detail files

- **`.claude/architecture.md`** — folder structure, all DB tables, env vars, build order
- **`.claude/patterns.md`** — code patterns, service examples, form strategy, Drizzle examples