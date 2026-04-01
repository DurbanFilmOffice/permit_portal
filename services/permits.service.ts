import { permitsRepository } from '@/repositories/permits.repository'
import { isInternalRole } from '@/lib/validations/roles'
import type { Role } from '@/lib/validations/roles'

export const permitsService = {

  async getUserPermits(userId: string) {
    return permitsRepository.findByUser(userId)
  },

  async getPermitById(id: string, userId: string, userRole: Role) {
    const permit = await permitsRepository.findById(id)
    if (!permit) throw new Error('Application not found')

    // Applicants can only see their own permits
    if (!isInternalRole(userRole) && permit.userId !== userId) {
      throw new Error('You do not have access to this application')
    }
    return permit
  },
}