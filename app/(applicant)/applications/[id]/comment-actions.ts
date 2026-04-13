"use server";

import { auth } from "@/lib/auth";
import { commentsService } from "@/services/comments.service";
import { actionSuccess, actionError } from "@/lib/utils/action-response";
import type { Role } from "@/lib/validations/roles";

export async function addCommentAction(permitId: string, body: string) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");

  try {
    const comment = await commentsService.addComment(
      permitId,
      session.user.id,
      session.user.role as Role,
      body,
    );
    return actionSuccess({
      ...comment,
      authorName: session.user.name ?? "Unknown",
    });
  } catch (err) {
    return actionError(err, "Failed to post comment");
  }
}

export async function editCommentAction(commentId: string, body: string) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");

  try {
    const comment = await commentsService.editComment(
      commentId,
      session.user.id,
      session.user.role as Role,
      body,
    );
    return actionSuccess({
      ...comment,
      authorName: session.user.name ?? "Unknown",
    });
  } catch (err) {
    return actionError(err, "Failed to edit comment");
  }
}

export async function deleteCommentAction(commentId: string) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");

  try {
    await commentsService.deleteComment(
      commentId,
      session.user.id,
      session.user.role as Role,
    );
    return actionSuccess();
  } catch (err) {
    return actionError(err, "Failed to delete comment");
  }
}
