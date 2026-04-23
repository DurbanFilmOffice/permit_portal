import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { permitsService } from "@/services/permits.service";
import PermitForm from "@/components/permits/permit-form";
import { APPLICANT_EDITABLE_STATUSES } from "@/lib/validations/permit-status";
import type { PermitFormValues } from "@/lib/validations/permit-form.schema";

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

  const { permit, documents } = detail;

  // Only the owner can edit
  if (permit.userId !== session.user.id) notFound();

  // Redirect away if status does not allow editing
  if (!APPLICANT_EDITABLE_STATUSES.includes(permit.status as never)) {
    redirect(`/applications/${id}`);
  }

  const raw = (permit.formData ?? {}) as Record<string, unknown>;

  const str = (v: unknown): string => (typeof v === "string" ? v : "");
  const strOpt = (v: unknown): string | undefined =>
    typeof v === "string" ? v : undefined;
  const num = (v: unknown): number | undefined =>
    typeof v === "number" ? v : undefined;
  const arr = (v: unknown): string[] =>
    Array.isArray(v) ? (v as string[]) : [];
  const yesNo = (v: unknown): "yes" | "no" => (v === "yes" ? "yes" : "no");
  const yesNoOpt = (v: unknown): "yes" | "no" | undefined =>
    v === "yes" || v === "no" ? v : undefined;

  const PRODUCTION_TYPES = [
    "web_content",
    "corporate_industrial",
    "animation",
    "drama_series",
    "telenovela",
    "other",
  ] as const;
  type PT = (typeof PRODUCTION_TYPES)[number];
  const productionType = (v: unknown): PT =>
    PRODUCTION_TYPES.includes(v as PT) ? (v as PT) : "web_content";

  const TIMEFRAMES = ["micro_shoot", "medium_shoot", "large_shoot"] as const;
  type TF = (typeof TIMEFRAMES)[number];
  const timeframe = (v: unknown): TF | undefined =>
    TIMEFRAMES.includes(v as TF) ? (v as TF) : undefined;

  const ROAD_PORTIONS = ["sidewalk", "traffic_island", "travel_lane"] as const;
  type RP = (typeof ROAD_PORTIONS)[number];
  const roadPortion = (v: unknown): RP | undefined =>
    ROAD_PORTIONS.includes(v as RP) ? (v as RP) : undefined;

  const ROAD_CLOSURES = [
    "intermittent",
    "stop_and_go",
    "full_closure",
  ] as const;
  type RC = (typeof ROAD_CLOSURES)[number];
  const roadClosure = (v: unknown): RC | undefined =>
    ROAD_CLOSURES.includes(v as RC) ? (v as RC) : undefined;

  const initialData: PermitFormValues = {
    projectName: permit.projectName ?? "",
    siteAddress: permit.siteAddress ?? "",
    description: permit.description ?? "",

    formData: {
      // Step 1
      productionCompany: str(raw.productionCompany),
      productionTitle: str(raw.productionTitle),
      startDate: str(raw.startDate),
      endDate: strOpt(raw.endDate),
      synopsis: strOpt(raw.synopsis),
      productionType: productionType(raw.productionType),
      applicationTimeframe: timeframe(raw.applicationTimeframe),
      estimatedBudget: strOpt(raw.estimatedBudget),
      producingEmail: str(raw.producingEmail),
      producingTelephone: strOpt(raw.producingTelephone),
      producingWebsite: strOpt(raw.producingWebsite),
      producingAddress: strOpt(raw.producingAddress),
      producingCellphone: str(raw.producingCellphone),
      contactFullName: str(raw.contactFullName),
      contactCellphone: str(raw.contactCellphone),
      contactAltCellphone: strOpt(raw.contactAltCellphone),
      contactDesignation: str(raw.contactDesignation),
      productionBackground: strOpt(raw.productionBackground),
      accommodationBooked: yesNoOpt(raw.accommodationBooked),
      numberOfRoomsBooked: strOpt(raw.numberOfRoomsBooked),

      // Step 2
      filmingLocationName: str(raw.filmingLocationName),
      filmingLocationAddress: str(raw.filmingLocationAddress),
      onSetContactNumber: str(raw.onSetContactNumber),
      callTime: str(raw.callTime),
      wrapTime: str(raw.wrapTime),
      descriptionOfScenes: strOpt(raw.descriptionOfScenes),
      crewCount: num(raw.crewCount),
      castTalentCount: num(raw.castTalentCount),
      backgroundCastCount: num(raw.backgroundCastCount),
      localBackgroundCastTalent: strOpt(raw.localBackgroundCastTalent),
      vehicleCars: num(raw.vehicleCars),
      vehicleVans: num(raw.vehicleVans),
      vehicleTrucks: num(raw.vehicleTrucks),
      vehicleBuses: num(raw.vehicleBuses),
      roadPortionFilmed: roadPortion(raw.roadPortionFilmed),

      // Step 3
      roadClosureType: roadClosure(raw.roadClosureType),
      numberOfLanes: strOpt(raw.numberOfLanes),
      estimatedParkingDuration: strOpt(raw.estimatedParkingDuration),
      numberOfPublicBaysRequired: num(raw.numberOfPublicBaysRequired),
      truckSizeTons: strOpt(raw.truckSizeTons),
      dateTrafficControlRequired: strOpt(raw.dateTrafficControlRequired),
      trafficControlStartDate: strOpt(raw.trafficControlStartDate),
      trafficControlEndDate: strOpt(raw.trafficControlEndDate),
      trafficStartAndWrapTime: strOpt(raw.trafficStartAndWrapTime),

      // Step 4
      firingPointDischargeArea: strOpt(raw.firingPointDischargeArea),
      materialList: strOpt(raw.materialList),
      emergencyPlan: strOpt(raw.emergencyPlan),

      // Step 5
      involvesAerialFilming: yesNo(raw.involvesAerialFilming),
      aerialFilmingLocation: strOpt(raw.aerialFilmingLocation),
      proposedActivityDetails: strOpt(raw.proposedActivityDetails),
      droneProposedActivityDetails: strOpt(raw.droneProposedActivityDetails),

      // Step 6
      equipment: arr(raw.equipment),
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
        isIncomplete={permit.status === "incomplete"}
        isDraft={permit.status === "draft"}
        existingDocuments={documents}
      />
    </div>
  );
}
