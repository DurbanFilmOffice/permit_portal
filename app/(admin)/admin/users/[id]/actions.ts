"use server";

import { auth } from "@/lib/auth";
import { usersService } from "@/services/users.service";
import type { Role } from "@/lib/validations/roles";

function requireAdminOrAbove(role: string) {
  if (!["admin", "super_admin"].includes(role)) {
    throw new Error("Unauthorised");
  }
}

export async function updateUserAction(
  targetUserId: string,
  data: { fullName: string },
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");
  requireAdminOrAbove(session.user.role);

  try {
    await usersService.updateUser(targetUserId, data);
    return { success: true };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to update user" };
  }
}

export async function sendPasswordResetAction(targetUserId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");
  requireAdminOrAbove(session.user.role);

  try {
    await usersService.sendPasswordReset(targetUserId);
    return { success: true };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to send password reset" };
  }
}

export async function setTemporaryPasswordAction(
  targetUserId: string,
  temporaryPassword: string,
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");
  requireAdminOrAbove(session.user.role);

  try {
    await usersService.setTemporaryPassword(targetUserId, temporaryPassword);
    return { success: true };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to set temporary password" };
  }
}

export async function changeRoleAction(targetUserId: string, newRole: Role) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");
  requireAdminOrAbove(session.user.role);

  try {
    await usersService.changeRole(
      targetUserId,
      newRole,
      session.user.id,
      session.user.role as Role,
    );
    return { success: true };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to change role" };
  }
}

export async function deactivateUserAction(targetUserId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");
  requireAdminOrAbove(session.user.role);

  try {
    await usersService.deactivateUser(targetUserId, session.user.id);
    return { success: true };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to deactivate user" };
  }
}

export async function reactivateUserAction(targetUserId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");
  requireAdminOrAbove(session.user.role);

  try {
    await usersService.reactivateUser(targetUserId);
    return { success: true };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to reactivate user" };
  }
}
