"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { canApproveReject } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";
import {
  approvePermitAction,
  rejectPermitAction,
} from "@/app/(admin)/admin/applications/[id]/approval-actions";

interface ApprovalActionsProps {
  permitId: string;
  currentStatus: string;
  currentUserRole: Role;
}

export function ApprovalActions({
  permitId,
  currentStatus,
  currentUserRole,
}: ApprovalActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  // Do not render if role cannot approve/reject or application is already closed
  if (!canApproveReject(currentUserRole)) return null;
  if (currentStatus === "approved" || currentStatus === "rejected") return null;

  function handleClose(setter: (v: boolean) => void) {
    setter(false);
    setReason("");
  }

  function handleApprove() {
    startTransition(async () => {
      const result = await approvePermitAction(permitId, reason || undefined);
      if (!result.success) {
        toast.error(result.error);
      } else {
        setApproveOpen(false);
        setReason("");
        router.refresh();
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectPermitAction(permitId, reason || undefined);
      if (!result.success) {
        toast.error(result.error);
      } else {
        setRejectOpen(false);
        setReason("");
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Approve button */}
        <Button
          onClick={() => setApproveOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white text-base"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve
        </Button>

        {/* Reject button */}
        <Button
          variant="destructive"
          onClick={() => setRejectOpen(true)}
          className="text-base"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </div>

      {/* Approve dialog */}
      <AlertDialog
        open={approveOpen}
        onOpenChange={(v) => {
          if (!v) handleClose(setApproveOpen);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Approve this application
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This will mark the application as approved and notify the
              applicant.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="approve-reason" className="text-base font-medium">
              Add a reason or note (optional)
            </Label>
            <Textarea
              id="approve-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. All documents verified and approved"
              className="text-base min-h-[80px]"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => handleClose(setApproveOpen)}
              className="text-base"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleApprove}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 text-white text-base"
            >
              {isPending ? "Approving…" : "Approve application"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject dialog */}
      <AlertDialog
        open={rejectOpen}
        onOpenChange={(v) => {
          if (!v) handleClose(setRejectOpen);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Reject this application
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This action is permanent. The application will be marked as
              rejected and the applicant will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="reject-reason" className="text-base font-medium">
              Add a reason for rejection (optional)
            </Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Incomplete documentation submitted"
              className="text-base min-h-[80px]"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => handleClose(setRejectOpen)}
              className="text-base"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending}
              className="text-base"
            >
              {isPending ? "Rejecting…" : "Reject application"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
