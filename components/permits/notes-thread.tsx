"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Lock, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  editNoteAction,
  deleteNoteAction,
} from "@/app/(admin)/admin/applications/[id]/note-actions";
import { NotesForm } from "@/components/permits/notes-form";
import { ROLE_CONFIG } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";

type NoteAuthor = {
  id: string;
  fullName: string;
  role: string;
};

type Note = {
  id: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: NoteAuthor;
};

type Props = {
  permitId: string;
  initialNotes: Note[];
  currentUserId: string;
  currentUserFullName: string;
  currentUserRole: Role;
};

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(date))
    .replace(",", " at");
}

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function isEdited(note: Note): boolean {
  return (
    new Date(note.updatedAt).getTime() - new Date(note.createdAt).getTime() >
    1000
  );
}

const INITIAL_VISIBLE = 5;

export function NotesThread({
  permitId,
  initialNotes,
  currentUserId,
  currentUserFullName,
  currentUserRole,
}: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);

  const totalCount = notes.length;
  const hasMore = totalCount > INITIAL_VISIBLE;
  const hiddenCount = totalCount - INITIAL_VISIBLE;
  const visibleNotes = isExpanded ? notes : notes.slice(-INITIAL_VISIBLE);

  const canDeleteAny = ["admin", "super_admin"].includes(currentUserRole);

  function handleNoteAdded(note: Note) {
    setNotes((prev) => [...prev, note]);
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setEditBody(note.body);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditBody("");
    setError(null);
  }

  function handleEdit(noteId: string) {
    if (editBody.trim().length < 3) {
      setError("Note must be at least 3 characters.");
      return;
    }
    startTransition(async () => {
      const result = await editNoteAction(noteId, editBody);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? { ...n, body: editBody.trim(), updatedAt: new Date() }
            : n,
        ),
      );
      setEditingId(null);
      setEditBody("");
      router.refresh();
    });
  }

  function handleDelete(noteId: string) {
    if (!window.confirm("Delete this note? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteNoteAction(noteId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Internal badge */}
      <div className="flex items-center gap-2 text-amber-600">
        <Lock className="h-4 w-4" />
        <span className="text-sm font-medium">
          Internal only — not visible to applicants
        </span>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {notes.length === 0 ? (
        <p className="text-base text-muted-foreground">
          No internal notes yet.
        </p>
      ) : (
        <>
          {/* Collapsed indicator */}
          {hasMore && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full py-2 text-base text-muted-foreground
                hover:text-amber-600 flex items-center justify-center
                gap-2 border border-dashed border-amber-200
                dark:border-amber-800 rounded-lg
                hover:border-amber-400 transition-colors"
            >
              <ChevronUp className="h-4 w-4" />
              View {hiddenCount} more note{hiddenCount !== 1 ? "s" : ""}
            </button>
          )}

          <ul className="space-y-3">
            {visibleNotes.map((note) => {
              const isAuthor = note.author.id === currentUserId;
              const canEdit = isAuthor;
              const canDelete = isAuthor || canDeleteAny;
              const roleLabel =
                ROLE_CONFIG[note.author.role as Role]?.label ??
                note.author.role;

              return (
                <li
                  key={note.id}
                  className="border-l-4 border-amber-400 bg-amber-500/5 rounded-r-md p-4 space-y-2"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="text-sm">
                        {getInitials(note.author.fullName)}
                      </AvatarFallback>
                    </Avatar>

                    <span className="text-base font-medium leading-none">
                      {note.author.fullName}
                    </span>

                    <Badge variant="secondary" className="text-sm">
                      {roleLabel}
                    </Badge>

                    <span className="text-sm text-muted-foreground ml-auto">
                      {formatTimestamp(note.createdAt)}
                    </span>

                    {isEdited(note) && (
                      <span className="text-sm italic text-muted-foreground">
                        (edited)
                      </span>
                    )}
                  </div>

                  {editingId === note.id ? (
                    <div className="space-y-2 pt-1">
                      <Textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        className="text-base resize-y min-h-[80px]"
                        maxLength={2000}
                        disabled={isPending}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEdit(note.id)}
                          disabled={isPending}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                          disabled={isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-base whitespace-pre-wrap">{note.body}</p>
                  )}

                  {(canEdit || canDelete) && editingId !== note.id && (
                    <div className="flex gap-1 pt-1">
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(note)}
                          disabled={isPending}
                          aria-label="Edit note"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(note.id)}
                          disabled={isPending}
                          aria-label="Delete note"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* View less */}
          {hasMore && isExpanded && (
            <button
              onClick={() => setIsExpanded(false)}
              className="w-full py-2 text-base text-muted-foreground
                hover:text-amber-600 flex items-center justify-center
                gap-2 border border-dashed border-amber-200
                dark:border-amber-800 rounded-lg
                hover:border-amber-400 transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
              View less
            </button>
          )}
        </>
      )}

      <NotesForm
        permitId={permitId}
        currentUserId={currentUserId}
        currentUserFullName={currentUserFullName}
        currentUserRole={currentUserRole}
        onAdd={handleNoteAdded}
      />
    </div>
  );
}
