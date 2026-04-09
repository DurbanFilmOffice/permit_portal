"use server";

import { auth } from "@/lib/auth";
import { usersService } from "@/services/users.service";
import type { Role } from "@/lib/validations/roles";
import { redirect } from "next/navigation";

function requireAdminOrAbove(role: string) {
  if (!["admin", "super_admin"].includes(role)) {
    throw new Error("Unauthorised");
  }
}

export async function createInternalUserAction(data: {
  fullName: string;
  email: string;
  role: Role;
  temporaryPassword: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");
  requireAdminOrAbove(session.user.role);

  try {
    const user = await usersService.createInternalUser(
      data,
      session.user.role as Role,
    );
    return { success: true, userId: user.id };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to create user" };
  }
}