"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  assignUserAction,
  unassignUserAction,
} from "@/app/(admin)/admin/applications/[id]/actions";
import { ROLE_CONFIG } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";

interface AssignedUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface Assignment {
  id: string;
  user: AssignedUser;
  assignedAt: Date;
  note: string | null;
}

interface InternalUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AssignmentPanelProps {
  permitId: string;
  assignments: Assignment[];
  internalUsers: InternalUser[];
  currentUserId: string;
  currentUserRole: Role;
}

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatAssignedAt(date: Date): string {
  return new Date(date).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AssignmentPanel({
  permitId,
  assignments,
  internalUsers,
  currentUserId,
  currentUserRole,
}: AssignmentPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const assignedUserIds = new Set(assignments.map((a) => a.user.id));

  const availableUsers = internalUsers.filter(
    (u) => !assignedUserIds.has(u.id),
  );

  function handleAssign() {
    if (!selectedUserId) return;
    setError(null);

    startTransition(async () => {
      const result = await assignUserAction(
        permitId,
        selectedUserId,
        note.trim() || undefined,
      );

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success("User assigned successfully");
      setSelectedUserId("");
      setNote("");
      router.refresh();
    });
  }

  function handleUnassign(userId: string, fullName: string) {
    const confirmed = window.confirm(`Remove ${fullName} from this permit?`);
    if (!confirmed) return;

    startTransition(async () => {
      const result = await unassignUserAction(permitId, userId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`${fullName} removed from permit`);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Assigned Team</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Assigned users list */}
        {assignments.length === 0 ? (
          <p className="text-base text-muted-foreground">
            No users assigned yet
          </p>
        ) : (
          <ul className="space-y-3">
            {assignments.map((assignment) => {
              const roleLabel =
                ROLE_CONFIG[assignment.user.role as Role]?.label ??
                assignment.user.role;

              return (
                <li key={assignment.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-base">
                      {getInitials(assignment.user.fullName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium leading-tight truncate">
                      {assignment.user.fullName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-sm">
                        {roleLabel}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatAssignedAt(assignment.assignedAt)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground
                               hover:text-destructive hover:bg-destructive/10"
                    disabled={isPending}
                    onClick={() =>
                      handleUnassign(
                        assignment.user.id,
                        assignment.user.fullName,
                      )
                    }
                    aria-label={`Remove ${assignment.user.fullName}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        <Separator />

        {/* Add user section */}
        <div className="space-y-3">
          <p className="text-base font-medium">Add Team Member</p>

          <div className="space-y-1">
            <Label className="text-base font-medium">Team member</Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={isPending || availableUsers.length === 0}
            >
              <SelectTrigger className="text-base">
                <SelectValue
                  placeholder={
                    availableUsers.length === 0
                      ? "All internal users assigned"
                      : "Select a team member"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => {
                  const roleLabel =
                    ROLE_CONFIG[user.role as Role]?.label ?? user.role;
                  return (
                    <SelectItem
                      key={user.id}
                      value={user.id}
                      className="text-base"
                    >
                      {user.fullName} — {roleLabel}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-base font-medium">Note</Label>
            <Input
              className="text-base"
              placeholder="Reason for assignment (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isPending}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            className="w-full text-base"
            disabled={!selectedUserId || isPending}
            onClick={handleAssign}
          >
            {isPending ? "Assigning…" : "Assign"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
