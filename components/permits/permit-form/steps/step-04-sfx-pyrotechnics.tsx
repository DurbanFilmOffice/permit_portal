"use client";

import type { UseFormReturn } from "react-hook-form";
import { CheckCircle2, ExternalLink } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileUploadField } from "@/components/permits/file-upload-field";
import type { PermitDocument } from "@/db/schema/permit-documents";
import {
  type PermitFormValues,
  DOCUMENT_TYPES,
} from "@/lib/validations/permit-form.schema";

interface Step04SfxPyrotechnicsProps {
  form: UseFormReturn<PermitFormValues>;
  files: Record<string, File | null>;
  onFileChange: (documentType: string, file: File | null) => void;
  existingDocuments?: PermitDocument[];
}

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

export function Step04SfxPyrotechnics({
  form,
  files,
  onFileChange,
  existingDocuments = [],
}: Step04SfxPyrotechnicsProps) {
  const existingDoc = (documentType: string): PermitDocument | undefined =>
    existingDocuments.find((d) => d.documentType === documentType);

  return (
    <div>
      {/* ── Section heading ──────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-semibold">SFX / Pyrotechnics</h2>
        <span className="rounded-full bg-secondary px-3 py-0.5 text-sm text-secondary-foreground">
          Optional
        </span>
      </div>
      <p className="text-base text-muted-foreground mb-6">
        Complete this section only if your production involves special effects,
        pyrotechnics, or firearms.
      </p>

      {/* ── Site Plan ────────────────────────────────────────── */}
      <h3 className="text-lg font-semibold mb-4">Site Plan</h3>

      <div className="space-y-4">
        <div className="space-y-1">
          <FileUploadField
            documentType={DOCUMENT_TYPES.SFX_SKETCH}
            label="Sketch / Site Plan"
            accept="application/pdf,image/jpeg,image/png"
            required={false}
            value={files[DOCUMENT_TYPES.SFX_SKETCH] ?? null}
            onChange={(file) => onFileChange(DOCUMENT_TYPES.SFX_SKETCH, file)}
            hint={
              existingDoc(DOCUMENT_TYPES.SFX_SKETCH) &&
              !files[DOCUMENT_TYPES.SFX_SKETCH]
                ? "Upload a new file to replace the existing one"
                : "Upload a sketch or site plan of the SFX area"
            }
          />
          {existingDoc(DOCUMENT_TYPES.SFX_SKETCH) && (
            <ExistingDocument
              doc={existingDoc(DOCUMENT_TYPES.SFX_SKETCH)!}
              hasNewFile={!!files[DOCUMENT_TYPES.SFX_SKETCH]}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="formData.firingPointDischargeArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Firing Point / Discharge Area
              </FormLabel>
              <FormControl>
                <Input
                  className="text-base"
                  placeholder="Describe the firing point or discharge area"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Qualifications & Documentation ───────────────────── */}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4">
        Qualifications &amp; Documentation
      </h3>

      <div className="space-y-1">
        <FileUploadField
          documentType={DOCUMENT_TYPES.PYROTECHNICIAN_QUALIFICATIONS}
          label="Pyrotechnician Qualifications"
          accept="application/pdf"
          required={false}
          value={files[DOCUMENT_TYPES.PYROTECHNICIAN_QUALIFICATIONS] ?? null}
          onChange={(file) =>
            onFileChange(DOCUMENT_TYPES.PYROTECHNICIAN_QUALIFICATIONS, file)
          }
          hint={
            existingDoc(DOCUMENT_TYPES.PYROTECHNICIAN_QUALIFICATIONS) &&
            !files[DOCUMENT_TYPES.PYROTECHNICIAN_QUALIFICATIONS]
              ? "Upload a new file to replace the existing one"
              : "Upload proof of qualifications (PDF only)"
          }
        />
        {existingDoc(DOCUMENT_TYPES.PYROTECHNICIAN_QUALIFICATIONS) && (
          <ExistingDocument
            doc={existingDoc(DOCUMENT_TYPES.PYROTECHNICIAN_QUALIFICATIONS)!}
            hasNewFile={!!files[DOCUMENT_TYPES.PYROTECHNICIAN_QUALIFICATIONS]}
          />
        )}
      </div>

      {/* ── Safety Details ───────────────────────────────────── */}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4">Safety Details</h3>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="formData.materialList"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Material List
              </FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[120px] text-base"
                  placeholder="List all materials with quantities, types, sizes, and Safety Data Sheets"
                  {...field}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Include quantities, types, sizes, and Safety Data Sheet
                references
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="formData.emergencyPlan"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Emergency Plan
              </FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[120px] text-base"
                  placeholder="Describe firefighting equipment, fire watch, and first aid arrangements"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
