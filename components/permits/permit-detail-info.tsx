import DOMPurify from "isomorphic-dompurify";
import type { Permit } from "@/db/schema/permits";

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

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-base font-medium">{value || "—"}</p>
    </div>
  );
}

function RichSection({ label, html }: { label: string; html: string }) {
  const clean = DOMPurify.sanitize(html);
  if (!clean) return null;
  return (
    <div className="border rounded-md p-4">
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </div>
  );
}

export default function PermitDetailInfo({ permit }: PermitDetailInfoProps) {
  const fd = (permit.formData ?? {}) as Record<string, unknown>;

  const str = (key: string) =>
    typeof fd[key] === "string" ? (fd[key] as string) : "";

  const equipment = Array.isArray(fd.equipment)
    ? (fd.equipment as string[]).join(", ") || "None selected"
    : "None selected";

  const yesNo = (key: string) => {
    const v = str(key);
    if (v === "yes") return "Yes";
    if (v === "no") return "No";
    return "—";
  };

  const genre = GENRE_LABELS[str("genre")] ?? str("genre") ?? "—";
  const permitType = permit.permitType ?? "—";

  return (
    <div className="space-y-6">
      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        <Field label="Genre" value={genre} />
        <Field label="Permit Type" value={permitType} />

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
        <Field label="Company Name" value={str("companyName")} />

        <div className="md:col-span-2">
          <Field label="Equipment" value={equipment} />
        </div>

        <Field
          label="Requires Traffic Control"
          value={yesNo("requiresTrafficControl")}
        />
        <Field label="Requires SFX Permit" value={yesNo("requiresSfxPermit")} />

        {str("involveDroneFilming") !== "" && (
          <Field
            label="Involves Drone Filming"
            value={yesNo("involveDroneFilming")}
          />
        )}
      </div>

      {/* Rich text sections */}
      <div className="space-y-4">
        <RichSection
          label="Description of Scenes"
          html={str("descriptionOfScenes")}
        />
        <RichSection
          label="Proposed Activity Details"
          html={str("proposedActivityDetails")}
        />
        <RichSection
          label="Drone Proposed Activity Details"
          html={str("droneProposedActivityDetails")}
        />
      </div>
    </div>
  );
}
