"use client";

import { useWatch } from "react-hook-form";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { FileUploadField } from "@/components/permits/file-upload-field";
import type { PermitDocument } from "@/db/schema/permit-documents";
import {
  type PermitFormValues,
  DOCUMENT_TYPES,
} from "@/lib/validations/permit-form.schema";

interface Step05AerialFilmingProps {
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

export function Step05AerialFilming({
  form,
  files,
  onFileChange,
  existingDocuments = [],
}: Step05AerialFilmingProps) {
  const involvesAerialFilming = useWatch({
    control: form.control,
    name: "formData.involvesAerialFilming",
  });

  const isAerial = involvesAerialFilming === "yes";

  const existingDoc = (documentType: string): PermitDocument | undefined =>
    existingDocuments.find((d) => d.documentType === documentType);

  const aerialField = (
    documentType: string,
    label: string,
    required: boolean,
    hint?: string,
  ) => (
    <div className="space-y-1">
      <FileUploadField
        documentType={documentType}
        label={label}
        accept="application/pdf"
        required={required && !existingDoc(documentType)}
        value={files[documentType] ?? null}
        onChange={(file) => onFileChange(documentType, file)}
        hint={
          existingDoc(documentType) && !files[documentType]
            ? "Upload a new file to replace the existing one"
            : hint
        }
      />
      {existingDoc(documentType) && (
        <ExistingDocument
          doc={existingDoc(documentType)!}
          hasNewFile={!!files[documentType]}
        />
      )}
    </div>
  );

  return (
    <div>
      {/* ── Section heading ──────────────────────────────────── */}
      <h2 className="text-xl font-semibold mb-2">Aerial Filming Application</h2>
      <p className="text-base text-muted-foreground mb-6">
        Drone &amp; Helicopter
      </p>

      {/* ── Toggle ───────────────────────────────────────────── */}
      <FormField
        control={form.control}
        name="formData.involvesAerialFilming"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Does your project involve aerial filming (drone or helicopter)?
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="mt-2 flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="aerial-yes" />
                  <label
                    htmlFor="aerial-yes"
                    className="text-base cursor-pointer"
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="aerial-no" />
                  <label
                    htmlFor="aerial-no"
                    className="text-base cursor-pointer"
                  >
                    No
                  </label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Conditional section ──────────────────────────────── */}
      {isAerial && (
        <div className="mt-6 rounded-lg border border-t-4 border-t-primary bg-muted/30 p-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="formData.aerialFilmingLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Aerial Filming Location &amp; Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="text-base"
                      placeholder="Specific location for aerial filming"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formData.proposedActivityDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Proposed Activity Details
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[120px] text-base"
                      placeholder="Describe the proposed aerial filming activity"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formData.droneProposedActivityDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Drone Proposed Activity Details
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[120px] text-base"
                      placeholder="Describe the specific drone activity details"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ── Mandatory Documentation ────────────────────── */}
          <Separator className="my-6" />
          <h3 className="text-lg font-semibold mb-2">
            Mandatory Drone Operator Documentation
          </h3>
          <p className="text-base text-muted-foreground mb-4">
            All documents below are required when aerial filming is involved.
          </p>

          <div className="space-y-6">
            {aerialField(
              DOCUMENT_TYPES.ROC_CERTIFICATE,
              "ROC – Remote Operating Certificate",
              true,
              "PDF only",
            )}

            {aerialField(
              DOCUMENT_TYPES.RPL_LICENCE,
              "RPL – Remote Pilot Licence",
              true,
            )}

            {aerialField(
              DOCUMENT_TYPES.ASL_LICENCE,
              "ASL – Air Services Licence",
              true,
            )}

            {aerialField(
              DOCUMENT_TYPES.AERIAL_PUBLIC_LIABILITY,
              "Public Liability Insurance",
              true,
            )}

            <div className="space-y-1">
              {aerialField(
                DOCUMENT_TYPES.AERIAL_DISASTER_FORM,
                "Approved Form (Disaster & Emergency Services Directorate)",
                true,
                "Approved form from the Public Safety & Disaster Management Directorate",
              )}
              <p className="text-sm text-muted-foreground italic">
                Download the application form from the Public Safety &amp;
                Disaster Management Directorate, complete it, and upload the
                approved version here.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
