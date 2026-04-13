import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { permitsService } from "@/services/permits.service";
import PermitForm from "@/components/permits/permit-form";
import type { PermitFormValues } from "@/lib/validations/permit-form.schema";

type Genre = PermitFormValues["formData"]["genre"];
type YesNo = "yes" | "no";

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

  const rawForm = (permit.formData ?? {}) as Record<string, unknown>;

  const str = (v: unknown): string => (typeof v === "string" ? v : "");
  const strOpt = (v: unknown): string | undefined =>
    typeof v === "string" ? v : undefined;
  const num = (v: unknown): number | undefined =>
    typeof v === "number" ? v : undefined;
  const arr = (v: unknown): string[] =>
    Array.isArray(v) ? (v as string[]) : [];

  const GENRES: Genre[] = [
    "feature_film",
    "documentary",
    "reality_show",
    "tv_series",
    "tv_commercial",
    "student_project",
    "stills_photography",
    "short_film",
    "music_video",
  ];
  const genre = (v: unknown): Genre =>
    GENRES.includes(v as Genre) ? (v as Genre) : "feature_film";

  const yesNo = (v: unknown): YesNo => (v === "yes" || v === "no" ? v : "no");
  const yesNoOpt = (v: unknown): YesNo | undefined =>
    v === "yes" || v === "no" ? v : undefined;

  const initialData: PermitFormValues = {
    projectName: permit.projectName,
    siteAddress: permit.siteAddress ?? "",
    formData: {
      companyName: str(rawForm.companyName),
      projectTitle: str(rawForm.projectTitle),
      startDate: str(rawForm.startDate),
      endDate: strOpt(rawForm.endDate),
      descriptionOfScenes: strOpt(rawForm.descriptionOfScenes),
      tags: strOpt(rawForm.tags),
      locationName: str(rawForm.locationName),
      locationAddress: str(rawForm.locationAddress),
      applicantContactNumber: str(rawForm.applicantContactNumber),
      startTime: str(rawForm.startTime),
      wrapTime: str(rawForm.wrapTime),
      genre: genre(rawForm.genre),
      equipment: arr(rawForm.equipment),
      numberOfCrew: num(rawForm.numberOfCrew),
      numberOfCars: num(rawForm.numberOfCars),
      numberOfCast: strOpt(rawForm.numberOfCast),
      numberOfExtras: strOpt(rawForm.numberOfExtras),
      requiresSfxPermit: yesNo(rawForm.requiresSfxPermit),
      gunSupervisorName: strOpt(rawForm.gunSupervisorName),
      sfxGunSupervisorContact: strOpt(rawForm.sfxGunSupervisorContact),
      initiationDetails: strOpt(rawForm.initiationDetails),
      numberOfRounds: strOpt(rawForm.numberOfRounds),
      numberOfResets: strOpt(rawForm.numberOfResets),
      requiresTrafficControl: yesNo(rawForm.requiresTrafficControl),
      roadIntersectionName: strOpt(rawForm.roadIntersectionName),
      dateTrafficControlRequired: strOpt(rawForm.dateTrafficControlRequired),
      trafficControlStartDate: strOpt(rawForm.trafficControlStartDate),
      trafficControlEndDate: strOpt(rawForm.trafficControlEndDate),
      trafficStartTimeAndWrapTime: strOpt(rawForm.trafficStartTimeAndWrapTime),
      involveDroneFilming: yesNo(rawForm.involveDroneFilming),
      proposedActivityDetails: strOpt(rawForm.proposedActivityDetails),
      droneOperatorHasLicense: yesNoOpt(rawForm.droneOperatorHasLicense),
      droneProposedActivityDetails: strOpt(
        rawForm.droneProposedActivityDetails,
      ),
      showAfterCreated:
        typeof rawForm.showAfterCreated === "boolean"
          ? rawForm.showAfterCreated
          : true,
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
