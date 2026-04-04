import { permitsRepository } from "@/repositories/permits.repository";
import { isInternalRole, canApproveReject } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";
import { permitDocumentsRepository } from "@/repositories/permit-documents.repository";
import type { PermitFormValues } from "@/lib/validations/permit-form.schema";
import { permitStatusHistoryRepository } from "@/repositories/permit-status-history.repository";
import { assignmentsService } from "@/services/assignments.service";

export const permitsService = {
  async getUserPermits(userId: string) {
    return permitsRepository.findByUser(userId);
  },

  async getPermitById(id: string, userId: string, userRole: Role) {
    const permit = await permitsRepository.findById(id);
    if (!permit) throw new Error("Application not found");

    // Applicants can only see their own permits
    if (!isInternalRole(userRole) && permit.userId !== userId) {
      throw new Error("You do not have access to this application");
    }
    return permit;
  },

  async approvePermit(
    permitId: string,
    officerId: string,
    officerRole: Role,
    reason?: string,
  ) {
    // Permission check — only permit_admin, admin, super_admin
    if (!canApproveReject(officerRole)) {
      throw new Error("You do not have permission to approve applications");
    }

    const permit = await permitsRepository.findById(permitId);
    if (!permit) throw new Error("Application not found");

    if (["approved", "rejected"].includes(permit.status)) {
      throw new Error("This application is already closed");
    }

    const updated = await permitsRepository.update(permitId, {
      status: "approved",
    });

    await permitStatusHistoryRepository.create({
      permitId,
      changedBy: officerId,
      oldStatus: permit.status,
      newStatus: "approved",
      comment: reason ?? null,
    });

    // Notification stub — wired in Phase 9
    // await notificationsService.onStatusChanged(updated, reason)

    return updated;
  },

  async rejectPermit(
    permitId: string,
    officerId: string,
    officerRole: Role,
    reason?: string,
  ) {
    // Permission check — permit_admin | admin | super_admin
    // NOTE: In the full workflow, 'rejected' is terminal and
    // intended for super_admin only (fraud/duplicate cases).
    // For now all canApproveReject roles can reject.
    // Revisit when workflow engine is implemented.
    if (!canApproveReject(officerRole)) {
      throw new Error("You do not have permission to reject applications");
    }

    const permit = await permitsRepository.findById(permitId);
    if (!permit) throw new Error("Application not found");

    if (["approved", "rejected"].includes(permit.status)) {
      throw new Error("This application is already closed");
    }

    const updated = await permitsRepository.update(permitId, {
      status: "rejected",
    });

    await permitStatusHistoryRepository.create({
      permitId,
      changedBy: officerId,
      oldStatus: permit.status,
      newStatus: "rejected",
      comment: reason ?? null,
    });

    // Notification stub — wired in Phase 9
    // await notificationsService.onStatusChanged(updated, reason)

    return updated;
  },

  async createDraft(
    userId: string,
    data: Pick<PermitFormValues, "projectName"> & {
      formData: Partial<PermitFormValues["formData"]>;
    },
  ) {
    return permitsRepository.createDraft({
      userId,
      permitType: "filming_permit",
      projectName: data.projectName,
      siteAddress: data.formData.locationAddress ?? "",
      description: data.formData.descriptionOfScenes ?? null,
      formData: data.formData,
      status: "draft",
    });
  },

  async submitPermit(
    permitId: string,
    userId: string,
    data: PermitFormValues,
    files: { name: string; url: string; type: string; size: number }[],
  ) {
    // 1. Verify ownership
    const permit = await permitsRepository.findById(permitId);
    if (!permit) throw new Error("Application not found");
    if (permit.userId !== userId) throw new Error("Forbidden");
    if (!["draft", "returned"].includes(permit.status)) {
      throw new Error("This application cannot be submitted");
    }

    // 2. Update permit data + set status to submitted
    await permitsRepository.update(permitId, {
      projectName: data.projectName,
      siteAddress: data.formData.locationAddress,
      description: data.formData.descriptionOfScenes ?? null,
      formData: data.formData,
    });
    const submitted = await permitsRepository.submit(permitId);

    // 3. Save document records
    await Promise.all(
      files.map((f) =>
        permitDocumentsRepository.create({
          permitId,
          fileName: f.name,
          fileUrl: f.url,
          fileType: f.type,
          fileSizeBytes: f.size,
        }),
      ),
    );

    // 4. Trigger notifications (stub — wired in notifications session)
    // await notificationsService.onPermitSubmitted(submitted)

    return submitted;
  },

  async getPermitDetail(id: string, userId: string, userRole: Role) {
    const [permit, history, documents] = await Promise.all([
      permitsService.getPermitById(id, userId, userRole),
      permitStatusHistoryRepository.findByPermit(id),
      permitDocumentsRepository.findByPermit(id),
    ]);
    return { permit, history, documents };
  },

  async updatePermit(permitId: string, userId: string, data: PermitFormValues) {
    const permit = await permitsRepository.findById(permitId);
    if (!permit) throw new Error("Application not found");
    if (permit.userId !== userId) throw new Error("Forbidden");

    const editableStatuses = ["draft", "submitted", "returned"];
    if (!editableStatuses.includes(permit.status)) {
      throw new Error("This application can no longer be edited");
    }

    return permitsRepository.update(permitId, {
      projectName: data.projectName,
      siteAddress: data.formData.locationAddress,
      description: data.formData.descriptionOfScenes ?? null,
      formData: data.formData,
    });
  },

  async resubmitPermit(
    permitId: string,
    userId: string,
    data: PermitFormValues,
  ) {
    await permitsService.updatePermit(permitId, userId, data);
    const resubmitted = await permitsRepository.submit(permitId);
    return resubmitted;
  },

  // Admin: all applications with optional filters
  async getAllPermits(filters?: { status?: string; search?: string }) {
    return permitsRepository.findAllWithFilters(filters);
  },

  // Internal user: only permits they are assigned to
  async getMyAssignedPermits(userId: string) {
    const ids = await assignmentsService.getAssignedPermitIds(userId);
    return permitsRepository.findByIds(ids);
  },
};
