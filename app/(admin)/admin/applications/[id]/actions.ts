"use server";

import { auth } from "@/lib/auth";
import { assignmentsService } from "@/services/assignments.service";
import type { Role } from "@/lib/validations/roles";

export async function assignUserAction(
  permitId: string,
  userId: string,
  note?: string,
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");

  try {
    await assignmentsService.assignUser(
      permitId,
      userId,
      session.user.id,
      session.user.role as Role,
      note,
    );
    return { success: true };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to assign user" };
  }
}

export async function unassignUserAction(
  permitId: string,
  userId: string,
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");

  try {
    await assignmentsService.unassignUser(
      permitId,
      userId,
      session.user.role as Role,
    );
    return { success: true };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to remove assignment" };
  }
}
