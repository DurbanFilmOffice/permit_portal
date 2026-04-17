"use server";

import { auth } from "@/lib/auth";
import { permitsService } from "@/services/permits.service";
import { actionSuccess, actionError } from "@/lib/utils/action-response";
import type { Role } from "@/lib/validations/roles";

export async function changeStatusAction(
  permitId: string,
  newStatus: string,
  reason?: string,
) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");

  try {
    await permitsService.changeStatus(
      permitId,
      newStatus,
      session.user.id,
      session.user.role as Role,
      reason,
    );
    return actionSuccess();
  } catch (err) {
    return actionError(err);
  }
}
