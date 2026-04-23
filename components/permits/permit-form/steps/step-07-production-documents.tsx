"use client";

import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FileUploadField } from "@/components/permits/file-upload-field";
import type { PermitDocument } from "@/db/schema/permit-documents";
import {
  type PermitFormValues,
  DOCUMENT_TYPES,
  PRODUCTION_TYPE_OPTIONS,
} from "@/lib/validations/permit-form.schema";

interface Step07ProductionDocumentsProps {
  form: UseFormReturn<PermitFormValues>;
  files: Record<string, File | null>;
  onFileChange: (documentType: string, file: File | null) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  mode: "create" | "edit";
  isIncomplete?: boolean;
  existingDocuments?: PermitDocument[];
}

// Shows a previously uploaded document for a given type
function ExistingDocument({
  doc,
  hasNewFile,
}: {
  doc: PermitDocument;
  hasNewFile: boolean;
}) {
  if (hasNewFile) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 mt-2">
      <CheckCircle2
        className="h-4 w-4 shrink-0 text-green-600"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium truncate">{doc.fileName}</p>
        <p className="text-sm text-muted-foreground">Already uploaded</p>
      </div>
      <a
        href={doc.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline shrink-0"
      >
        View <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>
  );
}

export function Step07ProductionDocuments({
  form,
  files,
  onFileChange,
  existingDocuments = [],
}: Step07ProductionDocumentsProps) {
  const productionTitle = useWatch({
    control: form.control,
    name: "formData.productionTitle",
  });
  const productionCompany = useWatch({
    control: form.control,
    name: "formData.productionCompany",
  });
  const filmingLocation = useWatch({
    control: form.control,
    name: "formData.filmingLocationName",
  });
  const startDate = useWatch({
    control: form.control,
    name: "formData.startDate",
  });
  const endDate = useWatch({ control: form.control, name: "formData.endDate" });
  const productionType = useWatch({
    control: form.control,
    name: "formData.productionType",
  });

  const productionTypeLabel =
    PRODUCTION_TYPE_OPTIONS.find((o) => o.value === productionType)?.label ??
    productionType ??
    "—";

  // Helper — find existing doc for a given type
  const existingDoc = (documentType: string): PermitDocument | undefined =>
    existingDocuments.find((d) => d.documentType === documentType);

  // Helper — render a FileUploadField with an existing doc indicator below it
  const uploadField = (
    documentType: string,
    label: string,
    required: boolean,
    hint?: string,
  ) => {
    const existing = existingDoc(documentType);
    const hasNewFile = !!files[documentType];
    return (
      <div className="space-y-1">
        <FileUploadField
          documentType={documentType}
          label={label}
          accept="application/pdf"
          required={required && !existing}
          value={files[documentType] ?? null}
          onChange={(file) => onFileChange(documentType, file)}
          hint={
            existing && !hasNewFile
              ? "Upload a new file to replace the existing one"
              : hint
          }
        />
        {existing && (
          <ExistingDocument doc={existing} hasNewFile={hasNewFile} />
        )}
      </div>
    );
  };

  return (
    <div>
      {/* ── Section heading ──────────────────────────────────── */}
      <h2 className="text-xl font-semibold mb-2">Production Documents</h2>
      <p className="text-base text-muted-foreground mb-6">
        Upload all required documents before submitting your application.
      </p>

      {/* ── Mandatory Documents ──────────────────────────────── */}
      <h3 className="text-lg font-semibold mb-2">Mandatory Documents</h3>
      <p className="text-base text-muted-foreground mb-4">
        These documents are required to submit your application.
      </p>

      <div className="space-y-6">
        {uploadField(
          DOCUMENT_TYPES.PUBLIC_LIABILITY_INSURANCE,
          "Public Liability Insurance",
          true,
          "PDF only — valid public liability insurance certificate",
        )}
        {uploadField(
          DOCUMENT_TYPES.CITY_INDEMNITY,
          "City Indemnity",
          true,
          "PDF only — signed city indemnity form",
        )}
      </div>

      {/* ── Optional Documents ───────────────────────────────── */}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4">Optional Documents</h3>

      <div className="space-y-6">
        {uploadField(
          DOCUMENT_TYPES.PROOF_OF_PAYMENT,
          "Proof of Payment",
          false,
        )}
        {uploadField(
          DOCUMENT_TYPES.FILMING_SCHEDULE,
          "Filming Schedule",
          false,
        )}
        {uploadField(
          DOCUMENT_TYPES.SCRIPT_SYNOPSIS,
          "Script / Synopsis",
          false,
        )}
        {uploadField(
          DOCUMENT_TYPES.APPROVED_RISK_LETTER,
          "Approved Risk Categorisation Letter",
          false,
        )}
        {uploadField(
          DOCUMENT_TYPES.APPROVED_DISASTER_MANAGEMENT,
          "Approved Disaster Management & Safety Emergency Form",
          false,
        )}
        {uploadField(
          DOCUMENT_TYPES.COMPANY_LETTERHEAD,
          "Company Letterhead",
          false,
        )}
        {uploadField(DOCUMENT_TYPES.APPLICANT_ID, "Applicant's ID Copy", false)}
      </div>

      {/* ── Additional Supporting Documents ──────────────────── */}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-2">
        Additional Supporting Documents
      </h3>
      <p className="text-base text-muted-foreground mb-4">
        Upload up to 3 additional supporting documents.
      </p>

      <div className="space-y-6">
        {uploadField(
          DOCUMENT_TYPES.ADDITIONAL_1,
          "Additional Document 1",
          false,
        )}
        {uploadField(
          DOCUMENT_TYPES.ADDITIONAL_2,
          "Additional Document 2",
          false,
        )}
        {uploadField(
          DOCUMENT_TYPES.ADDITIONAL_3,
          "Additional Document 3",
          false,
        )}
      </div>

      {/* ── Application Summary ───────────────────────────────── */}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4">Application Summary</h3>

      <div className="rounded-lg bg-muted/50 p-4 space-y-2">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Production</p>
            <p className="text-base font-medium">{productionTitle || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Company</p>
            <p className="text-base font-medium">{productionCompany || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="text-base font-medium">{filmingLocation || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dates</p>
            <p className="text-base font-medium">
              {startDate || "—"} → {endDate || "TBC"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Production Type</p>
            <p className="text-base font-medium">{productionTypeLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
