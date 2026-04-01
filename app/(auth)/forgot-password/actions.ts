'use server'

import { forgotPasswordSchema } from '@/lib/validations/auth.schema'
import { authService } from '@/services/auth.service'

export async function forgotPasswordAction(formData: unknown) {
  const parsed = forgotPasswordSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // Always succeed — never reveal if email exists
  try {
    await authService.requestPasswordReset(parsed.data.email)
  } catch {
    // Swallow errors silently for security
  }

  return { success: true }
}