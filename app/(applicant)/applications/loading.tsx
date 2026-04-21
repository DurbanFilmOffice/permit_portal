import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 flex-wrap">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        {/* Header row */}
        <div className="flex items-center gap-4 p-4 border-b bg-muted/50">
          <Skeleton className="h-4 w-20 shrink-0" />
          <Skeleton className="h-4 w-40 shrink-0" />
          <Skeleton className="h-4 w-28 shrink-0" />
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-4 w-24 shrink-0" />
          <Skeleton className="h-4 w-16 shrink-0" />
        </div>

        {/* Data rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border-b last:border-0"
          >
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-28 shrink-0" />
            <Skeleton className="h-6 w-24 rounded-full shrink-0" />
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className="h-8 w-16 shrink-0" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}
