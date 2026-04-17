"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  VALID_TRANSITIONS,
  CAN_FINALISE_ROLES,
} from "@/lib/validations/permit-status";
import { changeStatusAction } from "@/app/(admin)/admin/applications/[id]/status-actions";
import type { Role } from "@/lib/validations/roles";

type ActionButton = {
  label: string;
  newStatus: string;
  icon: LucideIcon;
  variant: "default" | "outline" | "destructive";
  className?: string;
  requiresFinalise: boolean;
};

const ALL_ACTIONS: ActionButton[] = [
  {
    label: "Start Review",
    newStatus: "in_review",
    icon: Eye,
    variant: "outline",
    requiresFinalise: false,
  },
  {
    label: "Mark In Progress",
    newStatus: "in_progress",
    icon: Clock,
    variant: "outline",
    requiresFinalise: false,
  },
  {
    label: "Mark Incomplete",
    newStatus: "incomplete",
    icon: AlertCircle,
    variant: "outline",
    className:
      "border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950",
    requiresFinalise: false,
  },
  {
    label: "Approve",
    newStatus: "approved",
    icon: CheckCircle,
    variant: "default",
    className: "bg-green-600 hover:bg-green-700 text-white",
    requiresFinalise: true,
  },
  {
    label: "Reject",
    newStatus: "rejected",
    icon: XCircle,
    variant: "destructive",
    requiresFinalise: true,
  },
];

const ACTION_DESCRIPTIONS: Record<string, string> = {
  in_review: "This will mark the application as under review.",
  in_progress: "This will mark the application as in progress.",
  incomplete:
    "This will send the application back to the applicant to make corrections.",
  approved: "This will approve the application and notify the applicant.",
  rejected:
    "This action is permanent. The application will be closed and the applicant will be notified.",
};

const REASON_PLACEHOLDERS: Record<string, string> = {
  incomplete: "Describe what needs to be corrected...",
  rejected: "Provide a reason for rejection...",
};

interface ApplicationStatusActionsProps {
  permitId: string;
  currentStatus: string;
  currentUserRole: Role;
}

export default function ApplicationStatusActions({
  permitId,
  currentStatus,
  currentUserRole,
}: ApplicationStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<ActionButton | null>(null);
  const [reason, setReason] = useState("");

  // Do not render for non-internal roles
  if (["external_user", "applicant"].includes(currentUserRole)) return null;

  // Do not render for terminal statuses
  if (["approved", "rejected"].includes(currentStatus)) return null;

  const canFinalise = CAN_FINALISE_ROLES.includes(
    currentUserRole as (typeof CAN_FINALISE_ROLES)[number],
  );
  const validTargets = VALID_TRANSITIONS[currentStatus] ?? [];

  const visibleActions = ALL_ACTIONS.filter(
    (action) =>
      validTargets.includes(action.newStatus) &&
      (canFinalise || !action.requiresFinalise),
  );

  // Do not render if no valid actions for this role + status combination
  if (visibleActions.length === 0) return null;

  function handleClose() {
    setActiveAction(null);
    setReason("");
  }

  function handleConfirm() {
    if (!activeAction) return;

    startTransition(async () => {
      const result = await changeStatusAction(
        permitId,
        activeAction.newStatus,
        reason || undefined,
      );

      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success(
          `Application marked as ${activeAction.label.toLowerCase()}.`,
        );
        handleClose();
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="flex flex-row flex-wrap gap-2">
        {visibleActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.newStatus}
              variant={action.variant}
              className={action.className}
              onClick={() => setActiveAction(action)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          );
        })}
      </div>

      <AlertDialog
        open={!!activeAction}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {activeAction?.label} this application?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeAction ? ACTION_DESCRIPTIONS[activeAction.newStatus] : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="reason" className="text-base font-medium">
              Add a note (optional)
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                activeAction
                  ? (REASON_PLACEHOLDERS[activeAction.newStatus] ??
                    "Add any relevant notes...")
                  : ""
              }
              className="min-h-[80px] text-base"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleClose} disabled={isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant={activeAction?.variant ?? "default"}
              className={activeAction?.className}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? "Saving..." : (activeAction?.label ?? "Confirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
