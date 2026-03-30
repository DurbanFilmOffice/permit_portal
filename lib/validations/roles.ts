import { z } from "zod";

export const ROLES = [
  "applicant",
  "external_user",
  "permit_officer",
  "permit_admin",
  "admin",
  "super_admin",
] as const;

export type Role = (typeof ROLES)[number];
export const roleSchema = z.enum(ROLES);

export const INTERNAL_ROLES: Role[] = [
  "external_user",
  "permit_officer",
  "permit_admin",
  "admin",
  "super_admin",
];

export const ROLE_CONFIG: Record<Role, { label: string; badgeClass: string }> =
  {
    applicant: {
      label: "Applicant",
      badgeClass: "bg-secondary text-secondary-foreground",
    },
    external_user: {
      label: "External User",
      badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    },
    permit_officer: {
      label: "Permit Officer",
      badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    },
    permit_admin: {
      label: "Permit Admin",
      badgeClass: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
    },
    admin: {
      label: "Admin",
      badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
    super_admin: {
      label: "Super Admin",
      badgeClass: "bg-red-500/15 text-red-600 dark:text-red-400",
    },
  };

export const isInternalRole = (role: Role) => INTERNAL_ROLES.includes(role);

export const canAccessApplicantThread = (role: Role) =>
  (
    ["permit_officer", "permit_admin", "admin", "super_admin"] as Role[]
  ).includes(role);

export const canApproveReject = (role: Role) =>
  (["permit_admin", "admin", "super_admin"] as Role[]).includes(role);
