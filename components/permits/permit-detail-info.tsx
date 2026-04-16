import type { Permit } from "@/db/schema/permits";
import { Separator } from "@/components/ui/separator";
import { EQUIPMENT_OPTIONS } from "@/lib/validations/permit-form.schema";

interface PermitDetailInfoProps {
  permit: Permit;
}

const GENRE_LABELS: Record<string, string> = {
  feature_film: "Feature Film",
  documentary: "Documentary",
  reality_show: "Video - Reality Show",
  tv_series: "TV Series",
  tv_commercial: "TV Commercial",
  student_project: "Student Project",
  stills_photography: "Stills Photography",
  short_film: "Short Film",
  music_video: "Music Video",
};

function yesNo(value: string | undefined): string {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  return "—";
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-base font-medium">{value || "—"}</p>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Separator className="md:col-span-2 my-2" />
      <h2 className="text-xl font-semibold md:col-span-2 mt-4 mb-2">
        {children}
      </h2>
    </>
  );
}

export default function PermitDetailInfo({ permit }: PermitDetailInfoProps) {
  const fd = (permit.formData ?? {}) as Record<string, unknown>;

  const str = (key: string): string =>
    typeof fd[key] === "string" ? (fd[key] as string) : "";

  const genre = GENRE_LABELS[str("genre")] ?? str("genre") ?? "—";
  const permitType = str("permitType") || "—";

  const equipment = Array.isArray(fd.equipment)
    ? (fd.equipment as string[])
    : [];

  const hasSfx = str("requiresSfxPermit") === "yes";
  const hasTraffic = str("requiresTrafficControl") === "yes";
  const hasDrone = str("involveDroneFilming") === "yes";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {/* ── PROJECT & LOCATION ──────────────────────────────────────── */}
        <Field label="Genre" value={genre} />
        <Field label="Permit Type" value={permitType} />
        <Field label="Company Name" value={str("companyName")} />
        <Field label="Location Name" value={str("locationName")} />
        <Field label="Location Address" value={str("locationAddress")} />
        <Field label="Start Date" value={str("startDate")} />
        <Field label="End Date" value={str("endDate")} />
        <Field label="Start Time" value={str("startTime")} />
        <Field label="Wrap Time" value={str("wrapTime")} />
        <Field
          label="Applicant Contact"
          value={str("applicantContactNumber")}
        />

        {/* Description of Scenes — plain text, full width */}
        {str("descriptionOfScenes") && (
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground mb-1">
              Description of Scenes
            </p>
            <p className="text-base whitespace-pre-wrap">
              {str("descriptionOfScenes")}
            </p>
          </div>
        )}

        {/* ── EQUIPMENT ───────────────────────────────────────────────── */}
        <SectionHeading>Equipment &amp; Special Requirements</SectionHeading>

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
            <p className="text-base">None selected</p>
          )}
        </div>

        {/* ── CREW & SFX ──────────────────────────────────────────────── */}
        <SectionHeading>Crew &amp; SFX</SectionHeading>

        <Field label="Number of Crew" value={str("numberOfCrew")} />
        <Field label="Number of Cars" value={str("numberOfCars")} />
        <Field label="Number of Cast" value={str("numberOfCast")} />
        <Field label="Number of Extras" value={str("numberOfExtras")} />
        <Field
          label="Requires SFX / Special Effects Permit"
          value={yesNo(str("requiresSfxPermit"))}
        />

        {/* ── SFX DETAILS (conditional) ───────────────────────────────── */}
        {hasSfx && (
          <>
            <SectionHeading>SFX Details</SectionHeading>
            <Field
              label="Gun Supervisor Name"
              value={str("gunSupervisorName")}
            />
            <Field
              label="SFX / Gun Supervisor Contact"
              value={str("sfxGunSupervisorContact")}
            />
            <Field
              label="Initiation Details"
              value={str("initiationDetails")}
            />
            <Field label="Number of Rounds" value={str("numberOfRounds")} />
            <Field label="Number of Resets" value={str("numberOfResets")} />
          </>
        )}

        {/* ── TRAFFIC CONTROL ─────────────────────────────────────────── */}
        <SectionHeading>Traffic Control</SectionHeading>

        <Field
          label="Traffic Control / Road Closure"
          value={yesNo(str("requiresTrafficControl"))}
        />

        {hasTraffic && (
          <>
            <Field
              label="Road / Intersection Name"
              value={str("roadIntersectionName")}
            />
            <Field
              label="Date Required"
              value={str("dateTrafficControlRequired")}
            />
            <Field label="Start Date" value={str("trafficControlStartDate")} />
            <Field label="End Date" value={str("trafficControlEndDate")} />
            <Field
              label="Start &amp; Wrap Time"
              value={str("trafficStartTimeAndWrapTime")}
            />
          </>
        )}

        {/* ── DRONE FILMING ───────────────────────────────────────────── */}
        <SectionHeading>Drone Filming</SectionHeading>

        <Field
          label="Drone Filming"
          value={yesNo(str("involveDroneFilming"))}
        />

        {hasDrone && (
          <>
            <Field
              label="Drone Operator Has License"
              value={yesNo(str("droneOperatorHasLicense"))}
            />

            {str("proposedActivityDetails") && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">
                  Proposed Activity Details
                </p>
                <p className="text-base whitespace-pre-wrap">
                  {str("proposedActivityDetails")}
                </p>
              </div>
            )}

            {str("droneProposedActivityDetails") && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">
                  Drone Proposed Activity Details
                </p>
                <p className="text-base whitespace-pre-wrap">
                  {str("droneProposedActivityDetails")}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
