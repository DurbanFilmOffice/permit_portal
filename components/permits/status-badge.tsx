import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG } from "@/lib/validations/permit-status";
import type { PermitStatus } from "@/lib/validations/permit-status";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as PermitStatus];
  return (
    <Badge
      className={cn(
        config?.badgeClass ?? "bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {config?.label ?? status}
    </Badge>
  );
}
