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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileUploadField } from "@/components/permits/file-upload-field";
import type { PermitDocument } from "@/db/schema/permit-documents";
import {
  type PermitFormValues,
  ROAD_CLOSURE_OPTIONS,
  DOCUMENT_TYPES,
} from "@/lib/validations/permit-form.schema";

interface Step03TrafficAssistanceProps {
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

export function Step03TrafficAssistance({
  form,
  files,
  onFileChange,
  existingDocuments = [],
}: Step03TrafficAssistanceProps) {
  const roadClosureType = useWatch({
    control: form.control,
    name: "formData.roadClosureType",
  });

  const showLanes =
    roadClosureType === "intermittent" || roadClosureType === "stop_and_go";

  const existingDoc = (documentType: string): PermitDocument | undefined =>
    existingDocuments.find((d) => d.documentType === documentType);

  return (
    <div>
      {/* ── Section heading ──────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-xl font-semibold">
          Traffic Assistance, Parking &amp; Basecamp
        </h2>
        <span className="rounded-full bg-secondary px-3 py-0.5 text-sm text-secondary-foreground">
          Optional
        </span>
      </div>
      <p className="text-base text-muted-foreground mb-6">
        Complete this section only if your production requires traffic
        assistance, road closures, or basecamp parking.
      </p>

      {/* ── Road Closure ─────────────────────────────────────── */}
      <h3 className="text-lg font-semibold mb-4">Road Closure</h3>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="formData.roadClosureType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Road Closure Type
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Select if applicable" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ROAD_CLOSURE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-base"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showLanes && (
          <FormField
            control={form.control}
            name="formData.numberOfLanes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Number of Lanes
                </FormLabel>
                <FormControl>
                  <Input
                    className="text-base"
                    placeholder="e.g. 2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* ── Parking & Basecamp ───────────────────────────────── */}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4">Parking &amp; Basecamp</h3>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="formData.estimatedParkingDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Estimated Parking Duration
                </FormLabel>
                <FormControl>
                  <Input
                    className="text-base"
                    placeholder="e.g. 4 hours, 2 days"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formData.numberOfPublicBaysRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Number of Public Bays Required
                </FormLabel>
                <FormControl>
                  <Input
                    className="text-base"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="formData.truckSizeTons"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Truck Size (Tons)
              </FormLabel>
              <FormControl>
                <Input
                  className="text-base"
                  placeholder="e.g. 8 tons"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Traffic Control Details ──────────────────────────── */}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4">Traffic Control Details</h3>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="formData.dateTrafficControlRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Date Traffic Control Required
                </FormLabel>
                <FormControl>
                  <Input className="text-base" type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formData.trafficControlStartDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Traffic Control Start Date
                </FormLabel>
                <FormControl>
                  <Input className="text-base" type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formData.trafficControlEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Traffic Control End Date
                </FormLabel>
                <FormControl>
                  <Input className="text-base" type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formData.trafficStartAndWrapTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Traffic Control Start and Wrap Time
                </FormLabel>
                <FormControl>
                  <Input
                    className="text-base"
                    placeholder="e.g. 06:00 – 18:00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* ── Illustrations ────────────────────────────────────── */}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4">
        Illustrations / Photo / Map
      </h3>

      <div className="space-y-1">
        <FileUploadField
          documentType={DOCUMENT_TYPES.TRAFFIC_ILLUSTRATION}
          label="Traffic / Parking Illustration"
          accept="application/pdf,image/jpeg,image/png"
          required={false}
          value={files[DOCUMENT_TYPES.TRAFFIC_ILLUSTRATION] ?? null}
          onChange={(file) =>
            onFileChange(DOCUMENT_TYPES.TRAFFIC_ILLUSTRATION, file)
          }
          hint={
            existingDoc(DOCUMENT_TYPES.TRAFFIC_ILLUSTRATION) &&
            !files[DOCUMENT_TYPES.TRAFFIC_ILLUSTRATION]
              ? "Upload a new file to replace the existing one"
              : "Upload a map, photo, or sketch showing the traffic and parking arrangements"
          }
        />
        {existingDoc(DOCUMENT_TYPES.TRAFFIC_ILLUSTRATION) && (
          <ExistingDocument
            doc={existingDoc(DOCUMENT_TYPES.TRAFFIC_ILLUSTRATION)!}
            hasNewFile={!!files[DOCUMENT_TYPES.TRAFFIC_ILLUSTRATION]}
          />
        )}
      </div>
    </div>
  );
}
