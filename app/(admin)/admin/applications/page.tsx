import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { permitsService } from "@/services/permits.service";
import { isInternalRole } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";
import ApplicationsTable, {
  ApplicationsTableSkeleton,
} from "@/components/permits/applications-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";

export default async function AdminApplicationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isInternalRole(session.user.role as Role)) {
    redirect("/applications");
  }

  const [allPermits, myPermits] = await Promise.all([
    permitsService.getAllPermits(),
    permitsService.getMyAssignedPermits(session.user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="text-base text-muted-foreground mt-1">
          Review and manage permit applications
        </p>
      </div>

      <Tabs defaultValue="all" className="flex flex-col">
        <TabsList className="justify-start">
          <TabsTrigger value="all" className="text-base">
            All Applications
            <span className="ml-2 text-sm text-muted-foreground">
              ({allPermits.length})
            </span>
          </TabsTrigger>
          <TabsTrigger value="mine" className="text-base">
            My Applications
            <span className="ml-2 text-sm text-muted-foreground">
              ({myPermits.length})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Suspense fallback={<ApplicationsTableSkeleton />}>
            <ApplicationsTable
              permits={allPermits}
              linkPrefix="/admin/applications"
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="mine" className="mt-6">
          <Suspense fallback={<ApplicationsTableSkeleton />}>
            {myPermits.length === 0 ? (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <p className="text-base text-muted-foreground">
                  You have no applications assigned to you yet
                </p>
              </div>
            ) : (
              <ApplicationsTable
                permits={myPermits}
                linkPrefix="/admin/applications"
              />
            )}
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
