"use server";

import { auth } from "@/lib/auth";
import { permitsService } from "@/services/permits.service";
import { actionSuccess, actionError } from "@/lib/utils/action-response";
import { canApproveReject } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";

export async function approvePermitAction(permitId: string, reason?: string) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");

  if (!canApproveReject(session.user.role as Role)) {
    return actionError("Unauthorised");
  }

  try {
    await permitsService.approvePermit(
      permitId,
      session.user.id,
      session.user.role as Role,
      reason,
    );
    return actionSuccess();
  } catch (err) {
    return actionError(err, "Failed to approve application");
  }
}

export async function rejectPermitAction(permitId: string, reason?: string) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");

  if (!canApproveReject(session.user.role as Role)) {
    return actionError("Unauthorised");
  }

  try {
    await permitsService.rejectPermit(
      permitId,
      session.user.id,
      session.user.role as Role,
      reason,
    );
    return actionSuccess();
  } catch (err) {
    return actionError(err, "Failed to reject application");
  }
}
