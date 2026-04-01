import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; className?: string }> = {
  draft: { label: "Draft" },
  submitted: {
    label: "Submitted",
    className: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  },
  under_review: {
    label: "Under Review",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  approved: {
    label: "Approved",
    className: "bg-green-500/15 text-green-600 dark:text-green-400",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/15 text-red-600 dark:text-red-400",
  },
  returned: {
    label: "Returned",
    className: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  if (!config) {
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return <Badge variant="secondary">{label}</Badge>;
  }

  if (!config.className) {
    return <Badge variant="secondary">{config.label}</Badge>;
  }

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
