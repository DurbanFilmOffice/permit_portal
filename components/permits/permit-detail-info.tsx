import type { Permit } from "@/db/schema/permits";
import type { PermitDocument } from "@/db/schema/permit-documents";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  PRODUCTION_TYPE_OPTIONS,
  EQUIPMENT_OPTIONS,
  TIMEFRAME_OPTIONS,
  ROAD_CLOSURE_OPTIONS,
  ROAD_PORTION_OPTIONS,
} from "@/lib/validations/permit-form.schema";

// ─── Document type labels ─────────────────────────────────────────────────────

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  location_illustration: "Location Illustration",
  traffic_illustration: "Traffic / Parking Illustration",
  sfx_sketch: "Sketch / Site Plan",
  pyrotechnician_qualifications: "Pyrotechnician Qualifications",
  roc_certificate: "ROC – Remote Operating Certificate",
  rpl_licence: "RPL – Remote Pilot Licence",
  asl_licence: "ASL – Air Services Licence",
  aerial_public_liability: "Public Liability Insurance (Aerial)",
  aerial_disaster_form: "Approved Disaster Management Form (Aerial)",
  public_liability_insurance: "Public Liability Insurance",
  city_indemnity: "City Indemnity",
  proof_of_payment: "Proof of Payment",
  filming_schedule: "Filming Schedule",
  script_synopsis: "Script / Synopsis",
  approved_risk_letter: "Approved Risk Categorisation Letter",
  approved_disaster_management:
    "Approved Disaster Management & Safety Emergency Form",
  company_letterhead: "Company Letterhead",
  applicant_id: "Applicant's ID Copy",
  additional_1: "Additional Document 1",
  additional_2: "Additional Document 2",
  additional_3: "Additional Document 3",
};

// ─── Document groups ──────────────────────────────────────────────────────────

const DOCUMENT_GROUPS: { label: string; types: string[] }[] = [
  {
    label: "Location Documents",
    types: ["location_illustration"],
  },
  {
    label: "Traffic Documents",
    types: ["traffic_illustration"],
  },
  {
    label: "SFX Documents",
    types: ["sfx_sketch", "pyrotechnician_qualifications"],
  },
  {
    label: "Aerial Filming Documents",
    types: [
      "roc_certificate",
      "rpl_licence",
      "asl_licence",
      "aerial_public_liability",
      "aerial_disaster_form",
    ],
  },
  {
    label: "Production Documents",
    types: [
      "public_liability_insurance",
      "city_indemnity",
      "proof_of_payment",
      "filming_schedule",
      "script_synopsis",
      "approved_risk_letter",
      "approved_disaster_management",
      "company_letterhead",
      "applicant_id",
      "additional_1",
      "additional_2",
      "additional_3",
    ],
  },
];

// ─── Helper functions ─────────────────────────────────────────────────────────

function getLabel(
  options: readonly { value: string; label: string }[],
  value: string | undefined,
): string {
  return options.find((o) => o.value === value)?.label ?? value ?? "—";
}

function yesNo(value: string | undefined): string {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  return "—";
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Reusable layout primitives ───────────────────────────────────────────────

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-base font-medium">{value || "—"}</p>
    </div>
  );
}

function FullWidthField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="md:col-span-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-base whitespace-pre-wrap">{value || "—"}</p>
    </div>
  );
}

function SectionHeading({
  children,
  optional = false,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="space-y-1 pt-2">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">{children}</h2>
        {optional && (
          <Badge className="bg-secondary text-secondary-foreground text-sm">
            Optional
          </Badge>
        )}
      </div>
      <Separator />
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PermitDetailInfoProps {
  permit: Permit;
  documents: PermitDocument[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PermitDetailInfo({
  permit,
  documents,
}: PermitDetailInfoProps) {
  const fd = (permit.formData ?? {}) as Record<string, unknown>;

  const str = (key: string): string =>
    typeof fd[key] === "string" ? (fd[key] as string) : "";

  const num = (key: string): number | undefined =>
    typeof fd[key] === "number" ? (fd[key] as number) : undefined;

  const equipment = Array.isArray(fd.equipment)
    ? (fd.equipment as string[])
    : [];

  const hasTraffic =
    str("roadClosureType") ||
    str("estimatedParkingDuration") ||
    str("truckSizeTons") ||
    str("dateTrafficControlRequired") ||
    str("trafficControlStartDate") ||
    str("trafficControlEndDate") ||
    str("trafficStartAndWrapTime") ||
    num("numberOfPublicBaysRequired") !== undefined;

  const hasSfx =
    str("firingPointDischargeArea") ||
    str("materialList") ||
    str("emergencyPlan");

  const isAerial = str("involvesAerialFilming") === "yes";

  return (
    <div className="space-y-6">
      {/* ── 1. Production Details ──────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Production Details</SectionHeading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Production Company" value={str("productionCompany")} />
          <Field label="Production Title" value={str("productionTitle")} />
          <Field label="Start Date" value={str("startDate")} />
          <Field label="End Date" value={str("endDate")} />
          <Field
            label="Production Type"
            value={getLabel(PRODUCTION_TYPE_OPTIONS, str("productionType"))}
          />
          <Field
            label="Application Timeframe"
            value={getLabel(TIMEFRAME_OPTIONS, str("applicationTimeframe"))}
          />
          <Field label="Estimated Budget" value={str("estimatedBudget")} />
          <Field
            label="Accommodation Booked"
            value={yesNo(str("accommodationBooked"))}
          />
          {str("accommodationBooked") === "yes" && (
            <Field
              label="Number of Rooms Booked"
              value={str("numberOfRoomsBooked")}
            />
          )}
          <FullWidthField
            label="Production Background"
            value={str("productionBackground")}
          />
        </div>
      </section>

      {/* ── 2. Producing Contact Details ───────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Producing Contact Details</SectionHeading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Email" value={str("producingEmail")} />
          <Field label="Cellphone" value={str("producingCellphone")} />
          <Field label="Telephone" value={str("producingTelephone")} />
          <Field label="Website" value={str("producingWebsite")} />
          <FullWidthField label="Address" value={str("producingAddress")} />
        </div>
      </section>

      {/* ── 3. Production Contact Person ───────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Production Contact Person</SectionHeading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Full Name" value={str("contactFullName")} />
          <Field label="Cellphone" value={str("contactCellphone")} />
          <Field
            label="Alternative Cellphone"
            value={str("contactAltCellphone")}
          />
          <Field label="Designation" value={str("contactDesignation")} />
        </div>
      </section>

      {/* ── 4. Synopsis ────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Synopsis</SectionHeading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FullWidthField label="Synopsis" value={permit.description ?? ""} />
        </div>
      </section>

      {/* ── 5. Location Application ────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Location Application</SectionHeading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Filming Location Name"
            value={str("filmingLocationName")}
          />
          <Field
            label="Filming Location Address"
            value={str("filmingLocationAddress")}
          />
          <Field
            label="On-set Contact Number"
            value={str("onSetContactNumber")}
          />
          <Field label="Call Time" value={str("callTime")} />
          <Field label="Wrap Time" value={str("wrapTime")} />
          <Field
            label="Road Portion Filmed"
            value={getLabel(ROAD_PORTION_OPTIONS, str("roadPortionFilmed"))}
          />
          <FullWidthField
            label="Description of Scenes"
            value={str("descriptionOfScenes")}
          />
        </div>
      </section>

      {/* ── 6. Crew & Cast ─────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Crew &amp; Cast</SectionHeading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Crew" value={num("crewCount")?.toString()} />
          <Field
            label="Cast / Talent"
            value={num("castTalentCount")?.toString()}
          />
          <Field
            label="Background Cast"
            value={num("backgroundCastCount")?.toString()}
          />
          <Field
            label="Local Background Cast & Talent"
            value={str("localBackgroundCastTalent")}
          />
        </div>
      </section>

      {/* ── 7. Vehicle Count ───────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Vehicle Count</SectionHeading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Cars" value={num("vehicleCars")?.toString()} />
          <Field label="Vans" value={num("vehicleVans")?.toString()} />
          <Field label="Trucks" value={num("vehicleTrucks")?.toString()} />
          <Field label="Buses" value={num("vehicleBuses")?.toString()} />
        </div>
      </section>

      {/* ── 8. Traffic Assistance (optional) ──────────────────── */}
      {hasTraffic && (
        <section className="space-y-4">
          <SectionHeading optional>
            Traffic Assistance, Parking &amp; Basecamp
          </SectionHeading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Road Closure Type"
              value={getLabel(ROAD_CLOSURE_OPTIONS, str("roadClosureType"))}
            />
            <Field label="Number of Lanes" value={str("numberOfLanes")} />
            <Field
              label="Estimated Parking Duration"
              value={str("estimatedParkingDuration")}
            />
            <Field
              label="Number of Public Bays Required"
              value={num("numberOfPublicBaysRequired")?.toString()}
            />
            <Field label="Truck Size (Tons)" value={str("truckSizeTons")} />
            <Field
              label="Date Traffic Control Required"
              value={str("dateTrafficControlRequired")}
            />
            <Field
              label="Traffic Control Start Date"
              value={str("trafficControlStartDate")}
            />
            <Field
              label="Traffic Control End Date"
              value={str("trafficControlEndDate")}
            />
            <Field
              label="Start and Wrap Time"
              value={str("trafficStartAndWrapTime")}
            />
          </div>
        </section>
      )}

      {/* ── 9. SFX / Pyrotechnics (optional) ──────────────────── */}
      {hasSfx && (
        <section className="space-y-4">
          <SectionHeading optional>SFX / Pyrotechnics</SectionHeading>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="Firing Point / Discharge Area"
              value={str("firingPointDischargeArea")}
            />
            <FullWidthField label="Material List" value={str("materialList")} />
            <FullWidthField
              label="Emergency Plan"
              value={str("emergencyPlan")}
            />
          </div>
        </section>
      )}

      {/* ── 10. Aerial Filming ─────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Aerial Filming</SectionHeading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Involves Aerial Filming"
            value={yesNo(str("involvesAerialFilming"))}
          />
          {isAerial && (
            <>
              <Field
                label="Aerial Filming Location"
                value={str("aerialFilmingLocation")}
              />
              <FullWidthField
                label="Proposed Activity Details"
                value={str("proposedActivityDetails")}
              />
              <FullWidthField
                label="Drone Proposed Activity Details"
                value={str("droneProposedActivityDetails")}
              />
            </>
          )}
        </div>
      </section>

      {/* ── 11. Special Requirements ───────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading>Special Requirements</SectionHeading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            {equipment.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {equipment.map((item) => (
                  <li key={item} className="text-base">
                    {EQUIPMENT_OPTIONS.find((o) => o.value === item)?.label ??
                      item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-muted-foreground">None selected</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Documents ──────────────────────────────────────────── */}
      {documents.length > 0 && (
        <section className="space-y-4">
          <SectionHeading>Documents</SectionHeading>

          <div className="space-y-6">
            {DOCUMENT_GROUPS.map((group) => {
              const groupDocs = documents.filter(
                (d) => d.documentType && group.types.includes(d.documentType),
              );
              if (groupDocs.length === 0) return null;

              return (
                <div key={group.label} className="space-y-3">
                  <h3 className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
                    {group.label}
                  </h3>
                  <div className="space-y-2">
                    {groupDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
                      >
                        <div>
                          <p className="text-base font-medium">
                            {doc.documentType
                              ? (DOCUMENT_TYPE_LABELS[doc.documentType] ??
                                doc.documentType)
                              : doc.fileName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {doc.fileName}
                            {doc.fileSizeBytes
                              ? ` · ${formatBytes(doc.fileSizeBytes)}`
                              : ""}
                          </p>
                        </div>
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base text-primary underline-offset-4 hover:underline"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
