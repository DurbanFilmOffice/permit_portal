"use server";

import { resetPasswordSchema } from "@/lib/validations/auth.schema";
import { authService } from "@/services/auth.service";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function resetPasswordAction(formData: unknown) {
  const parsed = resetPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await authService.resetPassword(parsed.data.token, parsed.data.password);
    redirect("/login?reset=success");
  } catch (err) {
    if (isRedirectError(err)) throw err; // let Next.js handle the redirect
    if (err instanceof Error) {
      return { error: { root: [err.message] } };
    }
    return { error: { root: ["Something went wrong. Please try again."] } };
  }
}
