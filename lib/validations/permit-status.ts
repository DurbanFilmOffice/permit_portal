import { z } from "zod";

export const PERMIT_STATUSES = [
  "draft",
  "submitted",
  "in_review",
  "in_progress",
  "incomplete",
  "approved",
  "rejected",
] as const;

export type PermitStatus = (typeof PERMIT_STATUSES)[number];
export const permitStatusSchema = z.enum(PERMIT_STATUSES);

export const STATUS_CONFIG: Record<
  PermitStatus,
  {
    label: string;
    badgeClass: string;
  }
> = {
  draft: {
    label: "Draft",
    badgeClass: "bg-secondary text-secondary-foreground",
  },
  submitted: {
    label: "Submitted",
    badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  in_review: {
    label: "In Review",
    badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  in_progress: {
    label: "In Progress",
    badgeClass: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  },
  incomplete: {
    label: "Incomplete",
    badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
  approved: {
    label: "Approved",
    badgeClass: "bg-green-500/15 text-green-600 dark:text-green-400",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "bg-red-500/15 text-red-600 dark:text-red-400",
  },
};

// Transition rules — enforced in permits.service.ts
export const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["submitted"],
  submitted: ["in_review", "incomplete", "approved", "rejected"],
  in_review: ["in_progress", "incomplete", "approved", "rejected"],
  in_progress: ["incomplete", "approved", "rejected"],
  incomplete: ["submitted"], // applicant resubmit only
  approved: [],
  rejected: [],
};

// Roles that can trigger review-level transitions
export const CAN_REVIEW_ROLES = [
  "permit_officer",
  "permit_admin",
  "admin",
  "super_admin",
] as const;

// Roles that can approve or reject
export const CAN_FINALISE_ROLES = [
  "permit_admin",
  "admin",
  "super_admin",
] as const;

// Statuses where applicant can edit and resubmit
export const APPLICANT_EDITABLE_STATUSES: PermitStatus[] = [
  "draft",
  "submitted",
  "incomplete",
];
