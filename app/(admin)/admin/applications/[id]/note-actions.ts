"use server";

import { auth } from "@/lib/auth";
import { notesService } from "@/services/notes.service";
import { isInternalRole } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";

export async function addNoteAction(permitId: string, body: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");
  if (!isInternalRole(session.user.role as Role)) {
    throw new Error("Unauthorised");
  }

  try {
    const note = await notesService.addNote(
      permitId,
      session.user.id,
      session.user.role as Role,
      body,
    );
    return { success: true, note };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to post note" };
  }
}

export async function editNoteAction(noteId: string, body: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");
  if (!isInternalRole(session.user.role as Role)) {
    throw new Error("Unauthorised");
  }

  try {
    const note = await notesService.editNote(
      noteId,
      session.user.id,
      session.user.role as Role,
      body,
    );
    return { success: true, note };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to edit note" };
  }
}

export async function deleteNoteAction(noteId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");
  if (!isInternalRole(session.user.role as Role)) {
    throw new Error("Unauthorised");
  }

  try {
    await notesService.deleteNote(
      noteId,
      session.user.id,
      session.user.role as Role,
    );
    return { success: true };
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    return { error: "Failed to delete note" };
  }
}
