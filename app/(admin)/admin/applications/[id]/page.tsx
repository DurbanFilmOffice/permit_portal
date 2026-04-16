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
import { commentsService } from "@/services/comments.service";
import { CommentThread } from "@/components/permits/comment-thread";
import { CommentForm } from "@/components/permits/comment-form";
import { notesService } from "@/services/notes.service";
import { NotesThread } from "@/components/permits/notes-thread";
import { NotesForm } from "@/components/permits/notes-form";
import { DeletedItemsPanel } from "@/components/permits/deleted-items-panel";

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

  const isExternalUser = session.user.role === "external_user";
  const isAdminOrAbove = ["admin", "super_admin"].includes(session.user.role);

  const [comments, notes] = await Promise.all([
    isExternalUser
      ? Promise.resolve([])
      : commentsService.getComments(id, session.user.role as Role),
    notesService.getNotes(id, session.user.role as Role),
  ]);

  const [deletedComments, deletedNotes] = isAdminOrAbove
    ? await Promise.all([
        commentsService.getDeletedComments(id, session.user.role as Role),
        notesService.getDeletedNotes(id, session.user.role as Role),
      ])
    : [[], []];

  return (
    <div className="space-y-8">
      <PermitDetailHeader
        permit={permit}
        isOwner={false}
        canEdit={false}
        currentUserRole={session.user.role as Role}
        showApprovalActions={true}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Application Details — 2/3 */}
        <div className="lg:col-span-2">
          <section className="border rounded-md bg-card p-10">
            <h2 className="text-xl font-semibold mb-4">Application Details</h2>
            <PermitDetailInfo permit={permit} />
          </section>
        </div>

        {/* Sidebar — 1/3, stacked */}
        <div className="space-y-8">
          <section className="border rounded-md bg-card p-3">
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

          <section className="border rounded-md bg-card p-3">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            {isExternalUser ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-base text-muted-foreground">
                  External users cannot access the comment thread.
                </p>
              </div>
            ) : (
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
                {/* <CommentForm
                  permitId={id}
                  currentUserRole={session.user.role as Role}
                  permitStatus={permit.status}
                  isExternalUser={false}
                /> */}
              </div>
            )}
            <DeletedItemsPanel
              type="comments"
              deletedItems={deletedComments}
              currentUserRole={session.user.role as Role}
            />
          </section>

          <section className="border rounded-md bg-card p-3">
            <h2 className="text-xl font-semibold mb-4">Internal Notes</h2>
            <div className="space-y-4">
              <NotesThread
                permitId={id}
                initialNotes={notes}
                currentUserId={session.user.id}
                currentUserFullName={session.user.name ?? ""}
                currentUserRole={session.user.role as Role}
              />
              {/* <NotesForm
                permitId={id}
                currentUserRole={session.user.role as Role}
              /> */}
            </div>
            <DeletedItemsPanel
              type="notes"
              deletedItems={deletedNotes}
              currentUserRole={session.user.role as Role}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
