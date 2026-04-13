"use server";

import { registerSchema } from "@/lib/validations/auth.schema";
import { authService } from "@/services/auth.service";
import { redirect } from "next/navigation";

type RegisterError = {
  root?: string[];
  fullName?: string[];
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
};

export async function registerAction(
  formData: unknown,
): Promise<{ error: RegisterError } | void> {
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  try {
    await authService.register({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      password: parsed.data.password,
    });
  } catch (err) {
    if (err instanceof Error) {
      return { error: { root: [err.message] } };
    }
    return { error: { root: ["Something went wrong. Please try again."] } };
  }

  redirect("/register/check-email");
}
