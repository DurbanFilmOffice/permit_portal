import { StatusBadge } from "@/components/permits/status-badge";

interface HistoryEntry {
  id: string;
  oldStatus: string | null;
  newStatus: string;
  comment: string | null;
  changedAt: Date;
  changedBy: {
    id: string;
    fullName: string;
    role: string;
  } | null;
}

interface StatusTimelineProps {
  history: HistoryEntry[];
}

const STATUS_DOT_COLOURS: Record<string, string> = {
  draft: "bg-zinc-400",
  submitted: "bg-blue-500",
  under_review: "bg-amber-500",
  approved: "bg-green-600",
  returned: "bg-purple-500",
  rejected: "bg-red-600",
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

export default function StatusTimeline({ history }: StatusTimelineProps) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No status updates yet.</p>
    );
  }

  return (
    <ol className="relative space-y-0">
      {history.map((entry, index) => {
        const isLast = index === history.length - 1;
        const dotColour = STATUS_DOT_COLOURS[entry.newStatus] ?? "bg-zinc-400";

        return (
          <li key={entry.id} className="flex gap-4">
            {/* Timeline gutter */}
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full shrink-0 ${dotColour} ${
                  isLast
                    ? "w-3.5 h-3.5 ring-2 ring-offset-2 ring-current"
                    : "w-2.5 h-2.5"
                } mt-1`}
              />
              {!isLast && <div className="w-px flex-1 bg-border mt-1 mb-1" />}
            </div>

            {/* Content */}
            <div className={`${isLast ? "pb-0" : "pb-6"}`}>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={entry.newStatus} />
                <span className="text-sm text-muted-foreground">
                  {formatTimestamp(entry.changedAt)}
                </span>
              </div>

              {entry.changedBy && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  by {entry.changedBy.fullName}
                </p>
              )}

              {entry.comment && (
                <div className="mt-2 pl-3 border-l-2 border-muted">
                  <p className="text-base text-muted-foreground italic">
                    — {entry.comment}
                  </p>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
