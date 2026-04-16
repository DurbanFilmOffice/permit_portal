import { commentsRepository } from "@/repositories/comments.repository";
import { permitsRepository } from "@/repositories/permits.repository";
import { usersRepository } from "@/repositories/users.repository";
import { notificationsService } from "@/services/notifications.service";
import type { Role } from "@/lib/validations/roles";

export const commentsService = {
  async getComments(permitId: string, requestingRole: Role) {
    if (requestingRole === "external_user") {
      throw new Error("External users cannot access the comment thread");
    }
    return commentsRepository.findByPermit(permitId);
  },

  async addComment(
    permitId: string,
    authorId: string,
    authorRole: Role,
    body: string,
  ) {
    if (authorRole === "external_user") {
      throw new Error("External users cannot post to the comment thread");
    }

    const permit = await permitsRepository.findById(permitId);
    if (!permit) throw new Error("Application not found");

    const applicantStatuses = ["submitted", "under_review", "returned"];
    if (
      authorRole === "applicant" &&
      !applicantStatuses.includes(permit.status)
    ) {
      throw new Error("Comments are closed for this application");
    }

    const comment = await commentsRepository.create({
      permitId,
      authorId,
      body: body.trim(),
    });

    const author = await usersRepository.findById(authorId);
    await notificationsService.onCommentAdded(
      permit,
      comment,
      author?.fullName ?? "A team member",
      authorRole,
    );

    return comment;
  },

  async editComment(
    commentId: string,
    editorId: string,
    editorRole: Role,
    body: string,
  ) {
    const comment = await commentsRepository.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    if (comment.authorId !== editorId) {
      throw new Error("You can only edit your own comments");
    }

    return commentsRepository.update(commentId, body.trim());
  },

  async deleteComment(commentId: string, deleterId: string, deleterRole: Role) {
    const comment = await commentsRepository.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    const canDelete =
      comment.authorId === deleterId ||
      ["admin", "super_admin"].includes(deleterRole);

    if (!canDelete) {
      throw new Error("You do not have permission to delete this comment");
    }

    return commentsRepository.delete(commentId);
  },

  async getDeletedComments(permitId: string, requestingRole: Role) {
    if (!["admin", "super_admin"].includes(requestingRole)) {
      throw new Error("You do not have permission to view deleted comments");
    }
    return commentsRepository.findByPermitWithDeleted(permitId);
  },

  async restoreComment(commentId: string, restorerRole: Role) {
    if (!["admin", "super_admin"].includes(restorerRole)) {
      throw new Error("You do not have permission to restore comments");
    }
    return commentsRepository.restore(commentId);
  },
};
