"use server";

import { auth } from "@/lib/auth";
import { notificationRecipientsService } from "@/services/notification-recipients.service";
import {
  addRecipientSchema,
  addPortalRecipientSchema,
} from "@/lib/validations/notification-recipient.schema";
import { actionSuccess, actionError } from "@/lib/utils/action-response";

function requireAdminAccess(role: string) {
  if (!["admin", "super_admin"].includes(role)) {
    throw new Error("Unauthorised");
  }
}

export async function addRecipientAction(formData: unknown) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");
  requireAdminAccess(session.user.role);

  const parsed = addRecipientSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  try {
    const recipient = await notificationRecipientsService.add(parsed.data);
    return actionSuccess(recipient);
  } catch (err) {
    return actionError(err);
  }
}

export async function addPortalRecipientAction(formData: unknown) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");
  requireAdminAccess(session.user.role);

  const parsed = addPortalRecipientSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  try {
    const recipient = await notificationRecipientsService.addPortalUser(
      parsed.data.userId,
    );
    return actionSuccess(recipient);
  } catch (err) {
    return actionError(err);
  }
}

export async function toggleRecipientAction(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");
  requireAdminAccess(session.user.role);

  try {
    await notificationRecipientsService.toggleActive(id, isActive);
    return actionSuccess();
  } catch (err) {
    return actionError(err);
  }
}

export async function removeRecipientAction(id: string) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");
  requireAdminAccess(session.user.role);

  try {
    await notificationRecipientsService.remove(id);
    return actionSuccess();
  } catch (err) {
    return actionError(err);
  }
}
