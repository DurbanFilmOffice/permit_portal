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
  ROAD_PORTION_OPTIONS,
  DOCUMENT_TYPES,
} from "@/lib/validations/permit-form.schema";

interface Step02LocationApplicationProps {
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

export function Step02LocationApplication({
  form,
  files,
  onFileChange,
  existingDocuments = [],
}: Step02LocationApplicationProps) {
  const existingDoc = (documentType: string): PermitDocument | undefined =>
    existingDocuments.find((d) => d.documentType === documentType);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Location Application</h2>

      {/* ── Filming Location ────────────────────────────────────── */}
      <h3 className="text-lg font-semibold mb-4">Filming Location</h3>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="formData.filmingLocationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Filming Location Name{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="text-base"
                  placeholder="e.g. V&A Waterfront, Cape Town CBD"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="formData.filmingLocationAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Filming Location Address / GPS Coordinates{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="text-base"
                  placeholder="Street address or GPS coordinates"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="formData.onSetContactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                On-set Contact Number{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="text-base"
                  type="tel"
                  placeholder="+27 82 000 0000"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="formData.callTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Call Time <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input className="text-base" type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formData.wrapTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Wrap Time <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input className="text-base" type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="formData.descriptionOfScenes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Description of Scenes to be Filmed
              </FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[100px] text-base"
                  placeholder="Describe the scenes that will be filmed at this location"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-1">
          <FileUploadField
            documentType={DOCUMENT_TYPES.LOCATION_ILLUSTRATION}
            label="Location Illustration"
            accept="application/pdf,image/jpeg,image/png"
            required={false}
            value={files[DOCUMENT_TYPES.LOCATION_ILLUSTRATION] ?? null}
            onChange={(file) =>
              onFileChange(DOCUMENT_TYPES.LOCATION_ILLUSTRATION, file)
            }
            hint={
              existingDoc(DOCUMENT_TYPES.LOCATION_ILLUSTRATION) &&
              !files[DOCUMENT_TYPES.LOCATION_ILLUSTRATION]
                ? "Upload a new file to replace the existing one"
                : "Upload a map, photo, or sketch of the filming location"
            }
          />
          {existingDoc(DOCUMENT_TYPES.LOCATION_ILLUSTRATION) && (
            <ExistingDocument
              doc={existingDoc(DOCUMENT_TYPES.LOCATION_ILLUSTRATION)!}
              hasNewFile={!!files[DOCUMENT_TYPES.LOCATION_ILLUSTRATION]}
            />
          )}
        </div>
      </div>

      {/* ── Crew & Cast ─────────────────────────────────────────── */}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4">Crew &amp; Cast</h3>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="formData.crewCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Crew</FormLabel>
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

          <FormField
            control={form.control}
            name="formData.castTalentCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Cast / Talent
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

          <FormField
            control={form.control}
            name="formData.backgroundCastCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Background Cast
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
          name="formData.localBackgroundCastTalent"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Local Background Cast &amp; Talent
              </FormLabel>
              <FormControl>
                <Input
                  className="text-base"
                  placeholder="Details about local background cast"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Vehicle Count ────────────────────────────────────────── */}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4">Vehicle Count</h3>

      <div className="grid gap-4 md:grid-cols-4">
        {(
          [
            { name: "formData.vehicleCars", label: "Cars" },
            { name: "formData.vehicleVans", label: "Vans" },
            { name: "formData.vehicleTrucks", label: "Trucks" },
            { name: "formData.vehicleBuses", label: "Buses" },
          ] as const
        ).map(({ name, label }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">{label}</FormLabel>
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
        ))}
      </div>

      {/* ── Road / Street Portion ────────────────────────────────── */}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4">
        Road / Street Portion to be Filmed
      </h3>

      <FormField
        control={form.control}
        name="formData.roadPortionFilmed"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Road Portion
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
              <FormControl>
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Select if applicable" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ROAD_PORTION_OPTIONS.map((option) => (
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
    </div>
  );
}
