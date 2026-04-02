import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { permitsService } from "@/services/permits.service";
import PermitDetailHeader from "@/components/permits/permit-detail-header";
import PermitDetailInfo from "@/components/permits/permit-detail-info";
import StatusTimeline from "@/components/permits/status-timeline";
import PermitDocumentsList from "@/components/permits/permit-documents-list";

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
  const editableStatuses = ["draft", "submitted", "returned"];
  const canEdit = isOwner && editableStatuses.includes(permit.status);

  return (
    <div className="space-y-8 max-w-4xl">
      <PermitDetailHeader permit={permit} isOwner={isOwner} canEdit={canEdit} />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content — 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4">Application Details</h2>
            <PermitDetailInfo permit={permit} />
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Documents</h2>
            <PermitDocumentsList documents={documents} />
          </section>
        </div>

        {/* Sidebar — 1/3 width */}
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4">Status History</h2>
            <StatusTimeline history={history} />
          </section>
        </div>
      </div>
    </div>
  );
}
