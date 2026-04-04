'use server'

import { auth } from '@/lib/auth'
import { permitsService } from '@/services/permits.service'
import { canApproveReject } from '@/lib/validations/roles'
import type { Role } from '@/lib/validations/roles'

export async function approvePermitAction(
  permitId: string,
  reason?: string,
) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorised')

  if (!canApproveReject(session.user.role as Role)) {
    throw new Error('Unauthorised')
  }

  try {
    await permitsService.approvePermit(
      permitId,
      session.user.id,
      session.user.role as Role,
      reason,
    )
    return { success: true }
  } catch (err) {
    if (err instanceof Error) return { error: err.message }
    return { error: 'Failed to approve application' }
  }
}

export async function rejectPermitAction(
  permitId: string,
  reason?: string,
) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorised')

  if (!canApproveReject(session.user.role as Role)) {
    throw new Error('Unauthorised')
  }

  try {
    await permitsService.rejectPermit(
      permitId,
      session.user.id,
      session.user.role as Role,
      reason,
    )
    return { success: true }
  } catch (err) {
    if (err instanceof Error) return { error: err.message }
    return { error: 'Failed to reject application' }
  }
}