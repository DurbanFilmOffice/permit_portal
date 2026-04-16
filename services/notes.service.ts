import { notesRepository } from "@/repositories/notes.repository";
import { permitsRepository } from "@/repositories/permits.repository";
import { assignmentsRepository } from "@/repositories/assignments.repository";
import { usersRepository } from "@/repositories/users.repository";
import { notificationsService } from "@/services/notifications.service";
import { isInternalRole } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";

export const notesService = {
  async getNotes(permitId: string, requestingRole: Role) {
    if (!isInternalRole(requestingRole)) {
      throw new Error("You do not have access to internal notes");
    }
    return notesRepository.findByPermit(permitId);
  },

  async addNote(
    permitId: string,
    authorId: string,
    authorRole: Role,
    body: string,
  ) {
    if (!isInternalRole(authorRole)) {
      throw new Error("You do not have access to internal notes");
    }

    const permit = await permitsRepository.findById(permitId);
    if (!permit) throw new Error("Application not found");

    const note = await notesRepository.create({
      permitId,
      authorId,
      body: body.trim(),
    });

    const assigned = await assignmentsRepository.findByPermit(permitId);
    const recipients = assigned.filter((a) => a.user.id !== authorId);
    if (recipients.length > 0) {
      const author = await usersRepository.findById(authorId);
      await notificationsService.onNoteAdded(
        permit,
        note,
        author?.fullName ?? "A team member",
        recipients,
      );
    }

    return note;
  },

  async editNote(
    noteId: string,
    editorId: string,
    editorRole: Role,
    body: string,
  ) {
    if (!isInternalRole(editorRole)) {
      throw new Error("You do not have access to internal notes");
    }

    const note = await notesRepository.findById(noteId);
    if (!note) throw new Error("Note not found");

    if (note.authorId !== editorId) {
      throw new Error("You can only edit your own notes");
    }

    return notesRepository.update(noteId, body.trim());
  },

  async deleteNote(noteId: string, deleterId: string, deleterRole: Role) {
    if (!isInternalRole(deleterRole)) {
      throw new Error("You do not have access to internal notes");
    }

    const note = await notesRepository.findById(noteId);
    if (!note) throw new Error("Note not found");

    const canDelete =
      note.authorId === deleterId ||
      ["admin", "super_admin"].includes(deleterRole);

    if (!canDelete) {
      throw new Error("You do not have permission to delete this note");
    }

    return notesRepository.delete(noteId);
  },

  async getDeletedNotes(permitId: string, requestingRole: Role) {
    if (!["admin", "super_admin"].includes(requestingRole)) {
      throw new Error("You do not have permission to view deleted notes");
    }
    return notesRepository.findByPermitWithDeleted(permitId);
  },

  async restoreNote(noteId: string, restorerRole: Role) {
    if (!["admin", "super_admin"].includes(restorerRole)) {
      throw new Error("You do not have permission to restore notes");
    }
    return notesRepository.restore(noteId);
  },
};
