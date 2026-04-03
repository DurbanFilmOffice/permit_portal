import { assignmentsRepository } from "@/repositories/assignments.repository";
import { usersRepository } from "@/repositories/users.repository";
import { isInternalRole } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";

export const assignmentsService = {
  async getPermitAssignments(permitId: string) {
    return assignmentsRepository.findByPermit(permitId);
  },

  async getInternalUsers() {
    return usersRepository.findInternalUsers();
  },

  async assignUser(
    permitId: string,
    userId: string,
    assignedBy: string,
    assignedByRole: Role,
    note?: string,
  ) {
    // Only internal roles can assign
    if (!isInternalRole(assignedByRole)) {
      throw new Error("You do not have permission to assign users");
    }

    // Prevent assigning applicants
    const user = await usersRepository.findById(userId);
    if (!user) throw new Error("User not found");
    if (!isInternalRole(user.role as Role)) {
      throw new Error("Applicants cannot be assigned to permits");
    }

    // Prevent duplicate assignments
    const existing = await assignmentsRepository.findOne(permitId, userId);
    if (existing) {
      throw new Error("User is already assigned to this permit");
    }

    return assignmentsRepository.create({
      permitId,
      userId,
      assignedBy,
      note: note ?? null,
    });
  },

  async unassignUser(permitId: string, userId: string, requestingRole: Role) {
    if (!isInternalRole(requestingRole)) {
      throw new Error("You do not have permission to unassign users");
    }
    return assignmentsRepository.delete(permitId, userId);
  },

  // For "My Applications" — returns permit IDs assigned to user
  async getAssignedPermitIds(userId: string) {
    const rows = await assignmentsRepository.findPermitsByUser(userId);
    return rows.map((r) => r.permitId);
  },
};
