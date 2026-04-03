"use server";

import { auth } from "@/lib/auth";
import { permitsService } from "@/services/permits.service";
import { permitFormSchema } from "@/lib/validations/permit-form.schema";
import { redirect } from "next/navigation";

export async function updatePermitAction(permitId: string, formData: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");

  const parsed = permitFormSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  try {
    await permitsService.updatePermit(permitId, session.user.id, parsed.data);
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Something went wrong. Please try again." };
  }
  redirect(`/applications/${permitId}`);
}

export async function resubmitPermitAction(
  permitId: string,
  formData: unknown,
) {
  console.log("resubmitPermitAction called", { permitId });
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");
  console.log("session ok", session.user.id);

  const parsed = permitFormSchema.safeParse(formData);
  console.log("parsed ok:", parsed.success);
  if (!parsed.success) {
    console.log("parse errors:", parsed.error.flatten());
    return { error: parsed.error.flatten() };
  }

  try {
    await permitsService.resubmitPermit(permitId, session.user.id, parsed.data);
  } catch (err) {
    console.log("resubmitPermit error:", err);
    if (err instanceof Error) return { error: err.message };
    return { error: "Something went wrong. Please try again." };
  }
  redirect(`/applications/${permitId}`);
}
