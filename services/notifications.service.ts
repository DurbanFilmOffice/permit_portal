import "server-only";

import { portalNotificationsRepository } from "@/repositories/portal-notifications.repository";
import { usersRepository } from "@/repositories/users.repository";
import { assignmentsRepository } from "@/repositories/assignments.repository";
import { notificationRecipientsRepository } from "@/repositories/notification-recipients.repository";
import { sendEmail } from "@/lib/email";
import { PermitSubmittedEmail } from "@/emails/permit-submitted";
import { PermitStatusUpdateEmail } from "@/emails/permit-status-update";
import { PermitCommentEmail } from "@/emails/permit-comment";
import { InternalNoteNotificationEmail } from "@/emails/internal-note-notification";
import AssignmentNotificationEmail from "@/emails/assignment-notification";
import { STATUS_CONFIG } from "@/lib/validations/permit-status";
import type { PermitStatus } from "@/lib/validations/permit-status";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

export const notificationsService = {
  // Called when applicant submits a permit
  async onPermitSubmitted(permit: {
    id: string;
    projectName: string;
    userId: string;
  }): Promise<void> {
    const applicant = await usersRepository.findById(permit.userId);
    if (!applicant) return;

    const ref = permit.id.slice(0, 8).toUpperCase();
    const portalUrl = `${APP_URL}/applications/${permit.id}`;

    // 1. Confirmation email to applicant
    await sendEmail({
      to: applicant.email,
      subject: `Permit application received — Ref #${ref}`,
      template: PermitSubmittedEmail({
        fullName: applicant.fullName,
        projectName: permit.projectName,
        referenceNumber: ref,
        portalUrl,
        variant: "applicant",
      }),
    });

    // 2. Portal notification to applicant
    await portalNotificationsRepository.create({
      userId: applicant.id,
      type: "permit_submitted",
      title: "Application submitted successfully",
      body: `Ref #${ref} — ${permit.projectName}`,
      permitId: permit.id,
    });

    // 3. Alert email to all active notification recipients
    const recipients = await notificationRecipientsRepository.findActive();
    await Promise.allSettled(
      recipients.map((r) =>
        sendEmail({
          to: r.email,
          subject: `New permit application — ${permit.projectName}`,
          template: PermitSubmittedEmail({
            fullName: r.name ?? "Permit Officer",
            projectName: permit.projectName,
            referenceNumber: ref,
            portalUrl: `${APP_URL}/admin/applications/${permit.id}`,
            variant: "officer",
          }),
        }),
      ),
    );
  },

  // Called on every status transition
  async onStatusChanged(
    permit: {
      id: string;
      projectName: string;
      userId: string;
      status: string;
    },
    reason?: string,
  ): Promise<void> {
    const applicant = await usersRepository.findById(permit.userId);
    if (!applicant) return;

    const ref = permit.id.slice(0, 8).toUpperCase();
    const portalUrl = `${APP_URL}/applications/${permit.id}`;

    const typeMap: Record<string, "permit_approved" | "permit_rejected" | "status_changed"> = {
      approved: "permit_approved",
      rejected: "permit_rejected",
    };
    const type = typeMap[permit.status] ?? "status_changed";

    const statusLabel =
      STATUS_CONFIG[permit.status as PermitStatus]?.label ?? permit.status;

    // Portal notification to applicant
    await portalNotificationsRepository.create({
      userId: applicant.id,
      type,
      title: `Your application status has been updated to: ${statusLabel}`,
      body: reason
        ? `Reason: ${reason}`
        : `Ref #${ref} — ${permit.projectName}`,
      permitId: permit.id,
    });

    // Email to applicant
    await sendEmail({
      to: applicant.email,
      subject: `Application update: ${statusLabel} — Ref #${ref}`,
      template: PermitStatusUpdateEmail({
        fullName: applicant.fullName,
        projectName: permit.projectName,
        referenceNumber: ref,
        newStatus: statusLabel,
        reason,
        portalUrl,
      }),
    });
  },

  // Called when a comment is added
  async onCommentAdded(
    permit: { id: string; projectName: string; userId: string },
    comment: { body: string },
    commenterName: string,
    commenterRole: string,
  ): Promise<void> {
    const ref = permit.id.slice(0, 8).toUpperCase();
    const isApplicant = commenterRole === "applicant";

    if (isApplicant) {
      // Notify all internal users assigned to this permit
      const assigned = await assignmentsRepository.findByPermit(permit.id);
      await Promise.allSettled(
        assigned.map(async (a) => {
          await portalNotificationsRepository.create({
            userId: a.user.id,
            type: "comment_added",
            title: "New comment on a permit application",
            body: `${permit.projectName} — Ref #${ref}`,
            permitId: permit.id,
          });
          await sendEmail({
            to: a.user.email,
            subject: `New comment — ${permit.projectName} Ref #${ref}`,
            template: PermitCommentEmail({
              recipientName: a.user.fullName,
              commenterName,
              commenterRole,
              projectName: permit.projectName,
              referenceNumber: ref,
              commentBody: comment.body.slice(0, 200),
              portalUrl: `${APP_URL}/admin/applications/${permit.id}`,
            }),
          });
        }),
      );
    } else {
      // Notify the applicant
      const applicant = await usersRepository.findById(permit.userId);
      if (!applicant) return;

      await portalNotificationsRepository.create({
        userId: applicant.id,
        type: "comment_added",
        title: "A permit officer commented on your application",
        body: `${permit.projectName} — Ref #${ref}`,
        permitId: permit.id,
      });

      await sendEmail({
        to: applicant.email,
        subject: `New comment on your application — Ref #${ref}`,
        template: PermitCommentEmail({
          recipientName: applicant.fullName,
          commenterName,
          commenterRole,
          projectName: permit.projectName,
          referenceNumber: ref,
          commentBody: comment.body.slice(0, 200),
          portalUrl: `${APP_URL}/applications/${permit.id}`,
        }),
      });
    }
  },

  // Called when an internal note is added
  async onNoteAdded(
    permit: { id: string; projectName: string },
    note: { body: string },
    authorName: string,
    assignedUsers: Array<{
      user: { id: string; email: string; fullName: string };
    }>,
  ): Promise<void> {
    const ref = permit.id.slice(0, 8).toUpperCase();
    const portalUrl = `${APP_URL}/admin/applications/${permit.id}`;

    await Promise.allSettled(
      assignedUsers.map(async (a) => {
        await portalNotificationsRepository.create({
          userId: a.user.id,
          type: "note_added",
          title: "New internal note on a permit application",
          body: `${permit.projectName} — Ref #${ref}`,
          permitId: permit.id,
        });

        await sendEmail({
          to: a.user.email,
          subject: `New internal note — ${permit.projectName} Ref #${ref}`,
          template: InternalNoteNotificationEmail({
            recipientName: a.user.fullName,
            authorName,
            projectName: permit.projectName,
            referenceNumber: ref,
            noteBody: note.body.slice(0, 200),
            portalUrl,
          }),
        });
      }),
    );
  },

  // Called when an internal user is assigned to a permit
  // Fire-and-forget — notification failure never blocks assignment
  async onUserAssigned(
    permit: {
      id: string;
      projectName: string;
      permitType: string;
    },
    assignedUser: {
      id: string;
      email: string;
      fullName: string;
    },
    assignedBy: {
      id: string;
      fullName: string;
    },
    note?: string,
  ): Promise<void> {
    const ref = permit.id.slice(0, 8).toUpperCase();
    const portalUrl = `${APP_URL}/admin/applications/${permit.id}`;

    // 1. Portal notification
    await portalNotificationsRepository.create({
      userId: assignedUser.id,
      type: "user_assigned",
      title: "You have been assigned to a permit application",
      body: `${permit.projectName} — Ref #${ref}`,
      permitId: permit.id,
    });

    // 2. Email notification
    await sendEmail({
      to: assignedUser.email,
      subject: `You have been assigned to a permit application — Ref #${ref}`,
      template: AssignmentNotificationEmail({
        recipientName: assignedUser.fullName,
        assignedByName: assignedBy.fullName,
        projectName: permit.projectName,
        referenceNumber: ref,
        permitType: permit.permitType,
        portalUrl,
        note,
      }),
    });
  },
};