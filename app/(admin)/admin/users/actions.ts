"use server";

import { auth } from "@/lib/auth";
import { usersService } from "@/services/users.service";
import { actionSuccess, actionError } from "@/lib/utils/action-response";
import type { ActionResponse } from "@/lib/utils/action-response";
import type { Role } from "@/lib/validations/roles";

function requireAdminOrAbove(role: string): ActionResponse | null {
  if (!["admin", "super_admin"].includes(role)) {
    return actionError("Unauthorised");
  }
  return null;
}

export async function changeRoleAction(targetUserId: string, newRole: Role) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");
  const authError = requireAdminOrAbove(session.user.role);
  if (authError) return authError;

  try {
    await usersService.changeRole(
      targetUserId,
      newRole,
      session.user.id,
      session.user.role as Role,
    );
    return actionSuccess();
  } catch (err) {
    return actionError(err, "Failed to change role");
  }
}

export async function deactivateUserAction(targetUserId: string) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");
  const authError = requireAdminOrAbove(session.user.role);
  if (authError) return authError;

  try {
    await usersService.deactivateUser(targetUserId, session.user.id);
    return actionSuccess();
  } catch (err) {
    return actionError(err, "Failed to deactivate user");
  }
}

export async function reactivateUserAction(targetUserId: string) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");
  const authError = requireAdminOrAbove(session.user.role);
  if (authError) return authError;

  try {
    await usersService.reactivateUser(targetUserId);
    return actionSuccess();
  } catch (err) {
    return actionError(err, "Failed to reactivate user");
  }
}
