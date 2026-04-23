import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { permitsService } from "@/services/permits.service";
import PermitDetailHeader from "@/components/permits/permit-detail-header";
import PermitDetailInfo from "@/components/permits/permit-detail-info";
import StatusTimeline from "@/components/permits/status-timeline";
import PermitDocumentsList from "@/components/permits/permit-documents-list";
import { commentsService } from "@/services/comments.service";
import { CommentThread } from "@/components/permits/comment-thread";
import { APPLICANT_EDITABLE_STATUSES } from "@/lib/validations/permit-status";
import type { Role } from "@/lib/validations/roles";

export default async function PermitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  let detail;
  try {
    detail = await permitsService.getPermitDetail(
      id,
      session.user.id,
      session.user.role,
    );
  } catch (err) {
    console.error("🔴 getPermitDetail failed:", err);
    notFound();
  }

  const { permit, history, documents } = detail;
  const isOwner = permit.userId === session.user.id;
  const canEdit =
    isOwner && APPLICANT_EDITABLE_STATUSES.includes(permit.status as never);
  const comments = await commentsService.getComments(
    id,
    session.user.role as Role,
  );

  return (
    <div className="space-y-8">
      <PermitDetailHeader permit={permit} isOwner={isOwner} canEdit={canEdit} />

      <div className="grid gap-8 lg:grid-cols-3 items-start lg:sticky lg:top-6">
        {/* Application Details — 2/3 */}
        <div className="lg:col-span-2 space-y-8">
          <section className="border rounded-md bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Application Details</h2>
            <PermitDetailInfo permit={permit} documents={documents} />
          </section>

          <section>
            {/* <h2 className="text-lg font-semibold mb-4">Documents</h2>
            <PermitDocumentsList documents={documents} /> */}
          </section>
        </div>

        {/* Sidebar — 1/3, sticky */}
        <div className="space-y-8 items-start lg:sticky lg:top-6">
          <section className="border rounded-md bg-card p-3">
            <h2 className="text-lg font-semibold mb-4">Status History</h2>
            <StatusTimeline history={history} />
          </section>

          <section className="border rounded-md bg-card p-3">
            <h2 className="text-lg font-semibold mb-4">Comments</h2>
            <div className="space-y-4">
              <CommentThread
                permitId={id}
                initialComments={comments}
                currentUserId={session.user.id}
                currentUserFullName={session.user.name ?? ""}
                currentUserRole={session.user.role as Role}
                permitStatus={permit.status}
                isExternalUser={false}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
