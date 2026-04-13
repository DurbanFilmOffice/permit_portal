"use server";

import { auth } from "@/lib/auth";
import { assignmentsService } from "@/services/assignments.service";
import { actionSuccess, actionError } from "@/lib/utils/action-response";
import type { ActionResponse } from "@/lib/utils/action-response";
import type { Role } from "@/lib/validations/roles";

export async function assignUserAction(
  permitId: string,
  userId: string,
  note?: string,
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");

  try {
    await assignmentsService.assignUser(
      permitId,
      userId,
      session.user.id,
      session.user.role as Role,
      note,
    );
    return actionSuccess();
  } catch (err) {
    return actionError(err, "Failed to assign user");
  }
}

export async function unassignUserAction(
  permitId: string,
  userId: string,
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");

  try {
    await assignmentsService.unassignUser(
      permitId,
      userId,
      session.user.role as Role,
    );
    return actionSuccess();
  } catch (err) {
    return actionError(err, "Failed to remove assignment");
  }
}
