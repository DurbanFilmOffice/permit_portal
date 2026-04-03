import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { permitsService } from "@/services/permits.service";
import { assignmentsService } from "@/services/assignments.service";
import PermitDetailHeader from "@/components/permits/permit-detail-header";
import PermitDetailInfo from "@/components/permits/permit-detail-info";
import StatusTimeline from "@/components/permits/status-timeline";
import AssignmentPanel from "@/components/permits/assignment-panel";
import { isInternalRole } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";

export default async function AdminPermitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isInternalRole(session.user.role as Role)) {
    redirect("/applications");
  }

  let detail: Awaited<ReturnType<typeof permitsService.getPermitDetail>>;
  try {
    detail = await permitsService.getPermitDetail(
      id,
      session.user.id,
      session.user.role as Role,
    );
  } catch {
    notFound();
  }

  const { permit, history } = detail;

  const [assignments, internalUsers] = await Promise.all([
    assignmentsService.getPermitAssignments(id),
    assignmentsService.getInternalUsers(),
  ]);

  return (
    <div className="space-y-8 max-w-5xl">
      <PermitDetailHeader permit={permit} isOwner={false} canEdit={false} />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Application Details</h2>
            <PermitDetailInfo permit={permit} />
          </section>

          {/* Comment thread placeholder — Phase 6 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-base text-muted-foreground">
                Comment thread coming soon
              </p>
            </div>
          </section>

          {/* Internal notes placeholder — Phase 7 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Internal Notes</h2>
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-base text-muted-foreground">
                Internal notes coming soon
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Status History</h2>
            <StatusTimeline history={history} />
          </section>

          <AssignmentPanel
            permitId={id}
            assignments={assignments}
            internalUsers={internalUsers}
            currentUserId={session.user.id}
            currentUserRole={session.user.role as Role}
          />
        </div>
      </div>
    </div>
  );
}
