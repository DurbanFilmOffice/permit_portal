import { notesRepository } from "@/repositories/notes.repository";
import { assignmentsRepository } from "@/repositories/assignments.repository";
import { isInternalRole } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";

export const notesService = {
  async getNotes(permitId: string, requestingRole: Role) {
    // Hard block — applicants can never see internal notes
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
    // Hard block — applicants can never write internal notes
    if (!isInternalRole(authorRole)) {
      throw new Error("You do not have access to internal notes");
    }

    const note = await notesRepository.create({
      permitId,
      authorId,
      body: body.trim(),
    });

    // Notify all assigned users except the author
    // Stub — wired in Phase 9 (notification bell session)
    // const assigned = await assignmentsRepository.findByPermit(permitId)
    // const recipients = assigned.filter(a => a.user.id !== authorId)
    // await notificationsService.onNoteAdded(permit, note, recipients)

    return note;
  },

  async editNote(
    noteId: string,
    editorId: string,
    editorRole: Role,
    body: string,
  ) {
    // Hard block — applicants cannot reach this
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
    // Hard block — applicants cannot reach this
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
};
