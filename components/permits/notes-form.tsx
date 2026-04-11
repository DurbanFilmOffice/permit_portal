"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addNoteAction } from "@/app/(admin)/admin/applications/[id]/note-actions";
import type { Role } from "@/lib/validations/roles";

const MIN_LENGTH = 3;
const MAX_LENGTH = 2000;

type Note = {
  id: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    fullName: string;
    role: string;
  };
};

type Props = {
  permitId: string;
  currentUserId: string;
  currentUserFullName: string;
  currentUserRole: Role;
  onAdd?: (note: Note) => void;
};

export function NotesForm({
  permitId,
  currentUserId,
  currentUserFullName,
  currentUserRole,
  onAdd,
}: Props) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (body.trim().length < MIN_LENGTH) {
      setError(`Note must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await addNoteAction(permitId, body);
      if (result.error) {
        setError(result.error);
        return;
      }
      const now = new Date();
      onAdd?.({
        id: result.note?.id ?? crypto.randomUUID(),
        body: body.trim(),
        createdAt: now,
        updatedAt: now,
        author: {
          id: currentUserId,
          fullName: currentUserFullName,
          role: currentUserRole,
        },
      });
      setBody("");
    });
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add an internal note..."
        maxLength={MAX_LENGTH}
        disabled={isPending}
        className="text-base min-h-[100px] resize-y focus-visible:ring-amber-400"
      />

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          {body.length} / {MAX_LENGTH}
        </span>
        <Button
          onClick={handleSubmit}
          disabled={isPending || body.trim().length < MIN_LENGTH}
        >
          {isPending ? "Posting…" : "Add note"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
