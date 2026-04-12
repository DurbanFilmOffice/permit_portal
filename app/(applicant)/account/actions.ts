"use server";

import { auth } from "@/lib/auth";
import { accountService } from "@/services/account.service";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "@/lib/validations/auth.schema";

export async function updateProfileAction(formData: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");

  const parsed = updateProfileSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await accountService.updateProfile(session.user.id, parsed.data.fullName);
    return { success: true };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to update profile" };
  }
}

export async function changePasswordAction(formData: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");

  const parsed = changePasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await accountService.changePassword(
      session.user.id,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );
    return { success: true };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to change password" };
  }
}
