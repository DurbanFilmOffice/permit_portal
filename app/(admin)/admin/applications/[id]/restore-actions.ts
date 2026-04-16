"use server";

import { auth } from "@/lib/auth";
import { commentsService } from "@/services/comments.service";
import { notesService } from "@/services/notes.service";
import { actionSuccess, actionError } from "@/lib/utils/action-response";
import type { Role } from "@/lib/validations/roles";

export async function restoreCommentAction(commentId: string) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");

  try {
    await commentsService.restoreComment(commentId, session.user.role as Role);
    return actionSuccess();
  } catch (err) {
    return actionError(err);
  }
}

export async function restoreNoteAction(noteId: string) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");

  try {
    await notesService.restoreNote(noteId, session.user.role as Role);
    return actionSuccess();
  } catch (err) {
    return actionError(err);
  }
}
