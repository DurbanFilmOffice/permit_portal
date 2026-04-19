import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="space-y-8 max-w-8xl">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Banner */}
      <Skeleton className="h-14 w-full rounded-lg" />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Add form skeleton */}
        <div className="lg:col-span-1 space-y-4">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>

        {/* Table skeleton */}
        <div className="lg:col-span-2 rounded-lg border">
          <div className="p-4 border-b space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
