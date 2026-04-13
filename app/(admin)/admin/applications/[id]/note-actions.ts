"use server";

import { auth } from "@/lib/auth";
import { notesService } from "@/services/notes.service";
import { actionSuccess, actionError } from "@/lib/utils/action-response";
import { isInternalRole } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";

export async function addNoteAction(permitId: string, body: string) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");
  if (!isInternalRole(session.user.role as Role)) {
    return actionError("Unauthorised");
  }

  try {
    const note = await notesService.addNote(
      permitId,
      session.user.id,
      session.user.role as Role,
      body,
    );
    return actionSuccess(note);
  } catch (err) {
    return actionError(err, "Failed to post note");
  }
}

export async function editNoteAction(noteId: string, body: string) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");
  if (!isInternalRole(session.user.role as Role)) {
    return actionError("Unauthorised");
  }

  try {
    const note = await notesService.editNote(
      noteId,
      session.user.id,
      session.user.role as Role,
      body,
    );
    return actionSuccess(note);
  } catch (err) {
    return actionError(err, "Failed to edit note");
  }
}

export async function deleteNoteAction(noteId: string) {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");
  if (!isInternalRole(session.user.role as Role)) {
    return actionError("Unauthorised");
  }

  try {
    await notesService.deleteNote(
      noteId,
      session.user.id,
      session.user.role as Role,
    );
    return actionSuccess();
  } catch (err) {
    return actionError(err, "Failed to delete note");
  }
}
