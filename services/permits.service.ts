import { permitsRepository } from "@/repositories/permits.repository";
import { isInternalRole } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";
import { permitDocumentsRepository } from "@/repositories/permit-documents.repository";
import type { PermitFormValues } from "@/lib/validations/permit-form.schema";
import { permitStatusHistoryRepository } from "@/repositories/permit-status-history.repository";
import { assignmentsService } from "@/services/assignments.service";
import { notificationsService } from "@/services/notifications.service";
import {
  VALID_TRANSITIONS,
  CAN_FINALISE_ROLES,
  APPLICANT_EDITABLE_STATUSES,
} from "@/lib/validations/permit-status";

export const permitsService = {
  async getUserPermits(userId: string) {
    return permitsRepository.findByUser(userId);
  },

  async getPermitById(id: string, userId: string, userRole: Role) {
    const permit = await permitsRepository.findById(id);
    if (!permit) throw new Error("Application not found");

    if (!isInternalRole(userRole) && permit.userId !== userId) {
      throw new Error("You do not have access to this application");
    }
    return permit;
  },

  async changeStatus(
    permitId: string,
    newStatus: string,
    requestingUserId: string,
    requestingRole: Role,
    reason?: string,
  ) {
    // Block external_user and applicant
    if (["external_user", "applicant"].includes(requestingRole)) {
      throw new Error("You cannot change application status");
    }

    const permit = await permitsRepository.findById(permitId);
    if (!permit) throw new Error("Application not found");

    // Validate transition
    const allowed = VALID_TRANSITIONS[permit.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${permit.status} to ${newStatus}`,
      );
    }

    // Validate role for finalising transitions
    const finalisingStatuses = ["approved", "rejected"];
    if (
      finalisingStatuses.includes(newStatus) &&
      !CAN_FINALISE_ROLES.includes(
        requestingRole as (typeof CAN_FINALISE_ROLES)[number],
      )
    ) {
      throw new Error(
        "You do not have permission to approve or reject applications",
      );
    }

    // Update permit status
    const updated = await permitsRepository.update(permitId, {
      status: newStatus,
    });

    // Write status history
    await permitStatusHistoryRepository.create({
      permitId,
      changedBy: requestingUserId,
      oldStatus: permit.status,
      newStatus,
      comment: reason ?? null,
    });

    // Notify applicant — fire and forget
    notificationsService
      .onStatusChanged(updated, reason)
      .catch((err) => console.error("Status change notification failed:", err));

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
      projectName: data.projectName,
      siteAddress: data.formData.locationAddress ?? "",
      description: data.formData.descriptionOfScenes ?? null,
      formData: { ...data.formData, permitType: "filming_permit" },
      status: "draft",
    });
  },

  async submitPermit(
    permitId: string,
    userId: string,
    data: PermitFormValues,
    files: { name: string; url: string; type: string; size: number }[],
  ) {
    const permit = await permitsRepository.findById(permitId);
    if (!permit) throw new Error("Application not found");
    if (permit.userId !== userId) throw new Error("Forbidden");
    if (!["draft", "incomplete"].includes(permit.status)) {
      throw new Error("This application cannot be submitted");
    }

    await permitsRepository.update(permitId, {
      projectName: data.projectName,
      siteAddress: data.formData.locationAddress,
      description: data.formData.descriptionOfScenes ?? null,
      formData: data.formData,
    });
    const submitted = await permitsRepository.submit(permitId);

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

    await notificationsService.onPermitSubmitted(submitted);

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

    if (!APPLICANT_EDITABLE_STATUSES.includes(permit.status as never)) {
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

  async getAllPermits(filters?: { status?: string; search?: string }) {
    return permitsRepository.findAllWithFilters(filters);
  },

  async getMyAssignedPermits(userId: string) {
    const ids = await assignmentsService.getAssignedPermitIds(userId);
    return permitsRepository.findByIds(ids);
  },

  async getFilteredPermits(
    filters: {
      search?: string;
      status?: string;
      tab?: string;
      from?: string;
      to?: string;
    },
    pagination: { limit: number; offset: number },
    currentUserId: string,
  ) {
    const enrichedFilters = {
      ...filters,
      assignedUserId: filters.tab === "mine" ? currentUserId : undefined,
    };

    const [rows, total] = await Promise.all([
      permitsRepository.findWithFilters(enrichedFilters, pagination),
      permitsRepository.countWithFilters(enrichedFilters),
    ]);

    return { rows, total };
  },

  async getFilteredUserPermits(
    userId: string,
    filters: {
      search?: string;
      status?: string;
    },
    pagination: { limit: number; offset: number },
  ) {
    const [rows, total] = await Promise.all([
      permitsRepository.findByUserWithFilters(userId, filters, pagination),
      permitsRepository.countByUserWithFilters(userId, filters),
    ]);
    return { rows, total };
  },
};
