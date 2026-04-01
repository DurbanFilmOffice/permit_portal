import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { permitsService } from "@/services/permits.service";
import ApplicationsTable, {
  ApplicationsTableSkeleton,
} from "@/components/permits/applications-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const permits = await permitsService.getUserPermits(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your permit applications
          </p>
        </div>
        <Button asChild>
          <Link href="/applications/new">
            <Plus className="h-4 w-4 mr-2" />
            New application
          </Link>
        </Button>
      </div>

      <Suspense fallback={<ApplicationsTableSkeleton />}>
        <ApplicationsTable permits={permits} />
      </Suspense>
    </div>
  );
}
