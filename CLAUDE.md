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

1. **No DB calls outside repositories.** All Drizzle queries live in `src/repositories/` only.
2. **No business logic outside services.** Route handlers and components call services. Nothing else.
3. **No `@supabase/supabase-js` outside `src/lib/db.ts` and `src/lib/storage.ts`.** DB host is swappable — keep it that way.
4. **No form fields as DB columns.** All permit form fields go in `form_data jsonb`. See `.claude/architecture.md`.
5. **No `any`.** TypeScript strict mode throughout.
6. **No new packages without confirmation.** Use what is already installed.
7. **Workflow engine is not built yet.** `workflow.service.ts` is stubs only. Do not implement it.
8. **Permit form is not defined yet.** `form_data` is jsonb. Do not add individual field columns.
9. **Internal notes are never visible to applicants.** `application_notes` is a separate table from `permit_comments`. Never query notes in any applicant-facing context. Enforced at service AND repository layer.
10. **`external_user` cannot access the applicant comment thread.** Block in `comments.service.ts` — not just in the UI.
11. **Applicants are never in `permit_assignments`.** The assignment table is for internal users only. Check role before inserting.
12. **`permit_officer` cannot approve or reject.** Only `permit_admin`, `admin`, and `super_admin` can. Enforce in `permits.service.ts`.

---

## Tech stack (quick reference)

| Concern | Choice |
|---|---|
| Framework | Next.js 15 — App Router |
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

| Status | Meaning |
|---|---|
| `draft` | Saved, not submitted |
| `submitted` | Submitted by applicant, awaiting review |
| `under_review` | Claimed by a reviewer |
| `approved` | All workflow steps passed |
| `returned` | Sent back to applicant for revision — applicant can edit and resubmit |
| `rejected` | Terminal. Super admin only. Application permanently closed. |

`returned` ≠ `rejected`. Returned is fixable. Rejected is final.

---

## Route protection

```
/app/(auth)/        → public
/app/(applicant)/     → any authenticated user
/app/(admin)/       → permit_officer | admin | super_admin
/app/(admin)/users  → admin | super_admin
/app/(admin)/config → super_admin only
```

---

## Not built yet — do not implement

- Workflow engine (`workflow.service.ts` exists as stubs — see `.claude/architecture.md`)
- Permit form fields (form structure TBD — `form_data jsonb` is the placeholder)
- Auth.js (proxy is passthrough skeleton — add after scaffold is reviewed)
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