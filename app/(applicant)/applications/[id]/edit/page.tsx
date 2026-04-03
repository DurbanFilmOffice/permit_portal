import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { permitsService } from "@/services/permits.service";
import PermitForm from "@/components/permits/permit-form";

export default async function EditPermitPage({
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
  } catch {
    notFound();
  }

  const { permit } = detail;

  // Only the owner can edit
  if (permit.userId !== session.user.id) notFound();

  // Redirect away if status does not allow editing
  const editableStatuses = ["draft", "submitted", "returned"];
  if (!editableStatuses.includes(permit.status)) {
    redirect(`/applications/${id}`);
  }

  // const initialData = {
  //   projectName: permit.projectName,
  //   siteAddress: permit.siteAddress ?? "",
  //   formData: (permit.formData ?? {}) as Record<string, unknown>,
  // };
  const rawForm = (permit.formData ?? {}) as Record<string, unknown>;

  const initialData = {
    projectName: permit.projectName,
    siteAddress: permit.siteAddress ?? "",
    formData: {
      companyName: rawForm.companyName ?? "",
      projectTitle: rawForm.projectTitle ?? "",
      startDate: rawForm.startDate ?? "",
      endDate: rawForm.endDate ?? "",
      descriptionOfScenes: rawForm.descriptionOfScenes ?? "",
      tags: rawForm.tags ?? "",
      locationName: rawForm.locationName ?? "",
      locationAddress: rawForm.locationAddress ?? "",
      applicantContactNumber: rawForm.applicantContactNumber ?? "",
      startTime: rawForm.startTime ?? "",
      wrapTime: rawForm.wrapTime ?? "",
      genre: rawForm.genre ?? undefined,
      equipment: rawForm.equipment ?? [],
      numberOfCrew: rawForm.numberOfCrew ?? undefined,
      numberOfCars: rawForm.numberOfCars ?? undefined,
      numberOfCast: rawForm.numberOfCast ?? "",
      numberOfExtras: rawForm.numberOfExtras ?? "",
      requiresSfxPermit: rawForm.requiresSfxPermit ?? undefined,
      gunSupervisorName: rawForm.gunSupervisorName ?? "",
      sfxGunSupervisorContact: rawForm.sfxGunSupervisorContact ?? "",
      initiationDetails: rawForm.initiationDetails ?? "",
      numberOfRounds: rawForm.numberOfRounds ?? "",
      numberOfResets: rawForm.numberOfResets ?? "",
      requiresTrafficControl: rawForm.requiresTrafficControl ?? undefined,
      roadIntersectionName: rawForm.roadIntersectionName ?? "",
      dateTrafficControlRequired: rawForm.dateTrafficControlRequired ?? "",
      trafficControlStartDate: rawForm.trafficControlStartDate ?? "",
      trafficControlEndDate: rawForm.trafficControlEndDate ?? "",
      trafficStartTimeAndWrapTime: rawForm.trafficStartTimeAndWrapTime ?? "",
      involveDroneFilming: rawForm.involveDroneFilming ?? undefined,
      proposedActivityDetails: rawForm.proposedActivityDetails ?? "",
      droneOperatorHasLicense: rawForm.droneOperatorHasLicense ?? undefined,
      droneProposedActivityDetails: rawForm.droneProposedActivityDetails ?? "",
      showAfterCreated: rawForm.showAfterCreated ?? true,
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit Application
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          Ref # {permit.id.slice(0, 8).toUpperCase()}
          {" · "}
          {permit.projectName}
        </p>
      </div>

      <PermitForm
        mode="edit"
        permitId={permit.id}
        initialData={initialData}
        isReturned={permit.status === "returned"}
      />
    </div>
  );
}
