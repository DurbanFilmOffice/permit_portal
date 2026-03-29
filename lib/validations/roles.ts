import { z } from 'zod'

export const ROLES = [
  'applicant',
  'permit_officer',
  'admin',
  'super_admin',
] as const

export type Role = typeof ROLES[number]
export const roleSchema = z.enum(ROLES)

// Role display config — extend this when new roles are added
// This is the ONLY place role labels, badge colours, and styles are defined
export const ROLE_CONFIG: Record<Role, {
  label: string
  badgeClass: string
}> = {
  applicant: {
    label: 'Applicant',
    badgeClass: 'bg-secondary text-secondary-foreground',
  },
  permit_officer: {
    label: 'Permit Officer',
    badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  admin: {
    label: 'Admin',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  super_admin: {
    label: 'Super Admin',
    badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400',
  },
}