"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { restoreCommentAction } from "@/app/(admin)/admin/applications/[id]/restore-actions";
import { restoreNoteAction } from "@/app/(admin)/admin/applications/[id]/restore-actions";
import {
  approvePermitAction,
  rejectPermitAction,
} from "@/app/(admin)/admin/applications/[id]/approval-actions";
import type { Role } from "@/lib/validations/roles";

interface DeletedItem {
  id: string;
  body: string;
  deletedAt: Date;
  createdAt: Date;
  author: { id: string; fullName: string; role: string };
}

interface DeletedItemsPanelProps {
  type: "comments" | "notes";
  deletedItems: DeletedItem[];
  currentUserRole: Role;
}

export function DeletedItemsPanel({
  type,
  deletedItems,
  currentUserRole,
}: DeletedItemsPanelProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Do not render if no deleted items or user is not admin/super_admin
  if (deletedItems.length === 0) return null;
  if (!["admin", "super_admin"].includes(currentUserRole)) return null;

  const label = type === "comments" ? "comment" : "note";
  const count = deletedItems.length;

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      const result =
        type === "comments"
          ? await restoreCommentAction(id)
          : await restoreNoteAction(id);

      if (result.success) {
        toast.success(
          `${label.charAt(0).toUpperCase() + label.slice(1)} restored`,
        );
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error(`Failed to restore ${label}`);
    } finally {
      setRestoringId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-base">
            {count} deleted {label}
            {count !== 1 ? "s" : ""}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3 space-y-3">
        {deletedItems.map((item) => (
          <div
            key={item.id}
            className="border-l-4 border-red-400 bg-red-500/5 rounded-md p-4 opacity-75"
          >
            {/* Top row: author info + timestamps */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-base font-medium">
                {item.author.fullName}
              </span>
              <Badge variant="secondary" className="text-sm">
                {item.author.role.replace("_", " ")}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Written {formatDate(item.createdAt)}
              </span>
              <span className="text-sm text-destructive">
                Deleted {formatDate(item.deletedAt)}
              </span>
            </div>

            {/* Body with strikethrough */}
            <p className="text-base whitespace-pre-wrap line-through mb-3">
              {item.body}
            </p>

            {/* Restore button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestore(item.id)}
              disabled={restoringId === item.id}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              {restoringId === item.id ? "Restoring…" : "Restore"}
            </Button>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
