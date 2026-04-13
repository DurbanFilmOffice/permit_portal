"use server";

import { auth } from "@/lib/auth";
import { accountService } from "@/services/account.service";
import { actionSuccess, actionError } from "@/lib/utils/action-response";
import {
  updateProfileSchema,
  changePasswordSchema,
} from "@/lib/validations/auth.schema";

export async function updateProfileAction(formData: unknown) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");

  const parsed = updateProfileSchema.safeParse(formData);
  if (!parsed.success) {
    return actionError("Validation failed");
  }

  try {
    await accountService.updateProfile(session.user.id, parsed.data.fullName);
    return actionSuccess();
  } catch (err) {
    return actionError(err, "Failed to update profile");
  }
}

export async function changePasswordAction(formData: unknown) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");

  const parsed = changePasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return actionError("Validation failed");
  }

  try {
    await accountService.changePassword(
      session.user.id,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );
    return actionSuccess();
  } catch (err) {
    return actionError(err, "Failed to change password");
  }
}
