"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { BellOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  toggleRecipientAction,
  removeRecipientAction,
} from "@/app/(admin)/admin/notifications/actions";

import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Recipient {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  userId: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface RecipientsTableProps {
  recipients: Recipient[];
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function RecipientRow({ recipient }: { recipient: Recipient }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(recipient.isActive);

  const isPortalUser = recipient.userId !== null;

  function handleToggle(checked: boolean) {
    setIsActive(checked);
    startTransition(async () => {
      const result = await toggleRecipientAction(recipient.id, checked);
      if (!result.success) {
        setIsActive(!checked);
        toast.error(result.error ?? "Failed to update recipient");
        return;
      }
      toast.success(checked ? "Recipient activated" : "Recipient deactivated");
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeRecipientAction(recipient.id);
      if (!result.success) {
        toast.error(result.error ?? "Failed to remove recipient");
        return;
      }
      toast.success("Recipient removed");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4 p-4">
      {/* Recipient */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium leading-none">
            {getInitials(recipient.name)}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-base font-medium truncate">
              {recipient.name ?? "-"}
            </p>
            <span
              className={[
                "inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium flex-shrink-0",
                isPortalUser
                  ? "bg-blue-500/15 text-blue-600"
                  : "bg-orange-500/15 text-orange-600",
              ].join(" ")}
            >
              {isPortalUser ? "Portal" : "External"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {recipient.email}
          </p>
        </div>
      </div>

      {/* Role label */}
      <div className="hidden sm:block w-40 flex-shrink-0">
        <p className="text-base text-muted-foreground truncate">
          {recipient.role ?? "—"}
        </p>
      </div>

      {/* Status badge */}
      <div className="hidden md:block flex-shrink-0">
        <span
          className={[
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium",
            isActive
              ? "bg-green-500/15 text-green-600"
              : "bg-red-500/15 text-red-600",
          ].join(" ")}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Added date */}
      <div className="hidden lg:block w-28 flex-shrink-0">
        <p className="text-base text-muted-foreground">
          {formatDate(recipient.createdAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => handleToggle(!isActive)}
          disabled={isPending}
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            isActive
              ? "bg-green-500/20 text-green-500 hover:bg-red-500/20 hover:text-red-500"
              : "bg-red-500/20 text-red-500 hover:bg-green-500/20 hover:text-green-500",
          ].join(" ")}
          aria-label={isActive ? "Deactivate recipient" : "Activate recipient"}
        >
          <span
            className={[
              "h-2 w-2 rounded-full",
              isActive ? "bg-green-500" : "bg-red-500",
            ].join(" ")}
          />
          {isActive ? "Active" : "Inactive"}
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              aria-label="Remove recipient"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold">
                Remove recipient?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base text-muted-foreground">
                <strong className="text-foreground font-medium">
                  {recipient.name}
                </strong>{" "}
                ({recipient.email}) will no longer receive permit submission
                alerts. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-base">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemove}
                className="text-base bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function RecipientsTable({ recipients }: RecipientsTableProps) {
  if (recipients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border-2 border-dashed border-muted m-4">
        <BellOff className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold mt-4">
          No notification recipients yet
        </p>
        <p className="text-base text-muted-foreground mt-2 text-center max-w-sm">
          Add portal users or external email addresses to receive alerts when
          new permit applications are submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {recipients.map((recipient) => (
        <RecipientRow key={recipient.id} recipient={recipient} />
      ))}
    </div>
  );
}
