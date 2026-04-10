"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import {
  editCommentAction,
  deleteCommentAction,
} from "@/app/(applicant)/applications/[id]/comment-actions";
import type { Role } from "@/lib/validations/roles";

type Comment = {
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
  initialComments: Comment[];
  currentUserId: string;
  currentUserRole: Role;
  permitStatus: string;
  isExternalUser: boolean;
};

const AVATAR_BG: Record<string, string> = {
  applicant: "bg-secondary",
  permit_officer: "bg-blue-500/20",
  permit_admin: "bg-teal-500/20",
  admin: "bg-amber-500/20",
  super_admin: "bg-red-500/20",
};

const ROLE_LABELS: Record<string, string> = {
  applicant: "Applicant",
  external_user: "External",
  permit_officer: "Permit Officer",
  permit_admin: "Permit Admin",
  admin: "Admin",
  super_admin: "Super Admin",
};

function formatTimestamp(date: Date): string {
  return new Date(date)
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
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

const INITIAL_VISIBLE = 5;

export function CommentThread({
  permitId,
  initialComments,
  currentUserId,
  currentUserRole,
  permitStatus,
  isExternalUser,
}: Props) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);

  if (isExternalUser) return null;

  const totalCount = comments.length;
  const hasMore = totalCount > INITIAL_VISIBLE;
  const hiddenCount = totalCount - INITIAL_VISIBLE;
  const visibleComments = isExpanded
    ? comments
    : comments.slice(-INITIAL_VISIBLE);

  const canDeleteComment = (comment: Comment) =>
    comment.author.id === currentUserId ||
    ["admin", "super_admin"].includes(currentUserRole);

  const canEditComment = (comment: Comment) =>
    comment.author.id === currentUserId;

  function handleEditStart(comment: Comment) {
    setEditingId(comment.id);
    setEditBody(comment.body);
    setError(null);
  }

  function handleEditCancel() {
    setEditingId(null);
    setEditBody("");
    setError(null);
  }

  function handleEditSave(commentId: string) {
    if (!editBody.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await editCommentAction(commentId, editBody);
      if (result.error) {
        setError(result.error);
        return;
      }
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, body: editBody.trim(), updatedAt: new Date() }
            : c,
        ),
      );
      setEditingId(null);
      setEditBody("");
      router.refresh();
    });
  }

  function handleDelete(commentId: string) {
    if (!window.confirm("Delete this comment? This cannot be undone.")) return;
    setError(null);

    startTransition(async () => {
      const result = await deleteCommentAction(commentId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      router.refresh();
    });
  }

  if (comments.length === 0) {
    return (
      <p className="text-base text-muted-foreground">
        No comments yet. Be the first to comment.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-base">{error}</AlertDescription>
        </Alert>
      )}

      {/* Collapsed indicator */}
      {hasMore && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full py-2 text-base text-muted-foreground
            hover:text-foreground flex items-center justify-center
            gap-2 border border-dashed rounded-lg
            hover:border-border transition-colors"
        >
          <ChevronUp className="h-4 w-4" />
          View {hiddenCount} more comment{hiddenCount !== 1 ? "s" : ""}
        </button>
      )}

      {/* Visible comments */}
      <div className="space-y-4">
        {visibleComments.map((comment) => {
          const isEditing = editingId === comment.id;
          const avatarBg = AVATAR_BG[comment.author.role] ?? "bg-secondary";
          const wasEdited =
            new Date(comment.updatedAt) > new Date(comment.createdAt);

          return (
            <div key={comment.id} className="flex gap-3">
              {/* Avatar */}
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className={`${avatarBg} text-base font-medium`}>
                  {getInitials(comment.author.fullName)}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Top row */}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-base font-medium">
                    {comment.author.fullName}
                  </span>

                  <span
                    className="text-sm text-muted-foreground rounded-full
                                   bg-muted px-2 py-0.5"
                  >
                    {ROLE_LABELS[comment.author.role] ?? comment.author.role}
                  </span>

                  <span className="text-sm text-muted-foreground">
                    {formatTimestamp(comment.createdAt)}
                  </span>

                  {wasEdited && (
                    <span className="text-sm text-muted-foreground italic">
                      (edited)
                    </span>
                  )}
                </div>

                {/* Body — view or edit mode */}
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="text-base min-h-[80px] resize-y"
                      disabled={isPending}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditSave(comment.id)}
                        disabled={isPending || !editBody.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditCancel}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-base whitespace-pre-wrap break-words">
                    {comment.body}
                  </p>
                )}

                {/* Action buttons */}
                {!isEditing && (
                  <div className="flex gap-1 mt-1">
                    {canEditComment(comment) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStart(comment)}
                        disabled={isPending}
                        aria-label="Edit comment"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canDeleteComment(comment) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(comment.id)}
                        disabled={isPending}
                        aria-label="Delete comment"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* View less */}
      {hasMore && isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="w-full py-2 text-base text-muted-foreground
            hover:text-foreground flex items-center justify-center
            gap-2 border border-dashed rounded-lg
            hover:border-border transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
          View less
        </button>
      )}
    </div>
  );
}
