"use client";

import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Info } from "lucide-react";
import {
  Form,
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
import {
  type PermitFormValues,
  PRODUCTION_TYPE_OPTIONS,
  TIMEFRAME_OPTIONS,
} from "@/lib/validations/permit-form.schema";

interface Step01ProductionDetailsProps {
  form: UseFormReturn<PermitFormValues>;
}

export function Step01ProductionDetails({
  form,
}: Step01ProductionDetailsProps) {
  const accommodationBooked = useWatch({
    control: form.control,
    name: "formData.accommodationBooked",
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Production Details</h2>

      {/* ── Basic Info ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="formData.productionCompany"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Production Company <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="text-base"
                  placeholder="Production company name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="formData.productionTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Production Title <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="text-base"
                  placeholder="Title of the production"
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
            name="formData.startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Start Date <span className="text-destructive">*</span>
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
            name="formData.endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  End Date
                </FormLabel>
                <FormControl>
                  <Input className="text-base" type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="formData.productionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Production Type <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Select production type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRODUCTION_TYPE_OPTIONS.map((option) => (
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

        <FormField
          control={form.control}
          name="formData.applicationTimeframe"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                <span className="flex items-center gap-1.5">
                  Application Timeframe
                  <Info
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Select estimated duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TIMEFRAME_OPTIONS.map((option) => (
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
              <p className="text-sm text-muted-foreground">
                Select the estimated duration of your production
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="formData.estimatedBudget"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Estimated Project Budget
              </FormLabel>
              <FormControl>
                <Input
                  className="text-base"
                  placeholder="e.g. R 500,000"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Producing Contact Details ───────────────────────────── */}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4">Producing Contact Details</h3>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="formData.producingEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Email <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="text-base"
                    type="email"
                    placeholder="email@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formData.producingCellphone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Cellphone <span className="text-destructive">*</span>
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

          <FormField
            control={form.control}
            name="formData.producingTelephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Telephone
                </FormLabel>
                <FormControl>
                  <Input
                    className="text-base"
                    type="tel"
                    placeholder="+27 21 000 0000"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formData.producingWebsite"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Website</FormLabel>
                <FormControl>
                  <Input
                    className="text-base"
                    type="url"
                    placeholder="https://example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="formData.producingAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Address</FormLabel>
              <FormControl>
                <Input
                  className="text-base"
                  placeholder="Street address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Production Contact Person ───────────────────────────── */}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4">Production Contact Person</h3>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="formData.contactFullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Full Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="text-base"
                    placeholder="Full name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formData.contactCellphone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Cellphone <span className="text-destructive">*</span>
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

          <FormField
            control={form.control}
            name="formData.contactAltCellphone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Alternative Cellphone
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

          <FormField
            control={form.control}
            name="formData.contactDesignation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Designation <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="text-base"
                    placeholder="e.g. Line Producer, Production Manager"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* ── Additional Information ──────────────────────────────── */}
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4">Additional Information</h3>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="formData.productionBackground"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Production Background
              </FormLabel>
              <FormControl>
                <Textarea
                  className="text-base"
                  placeholder="Background information about the production"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="formData.synopsis"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Synopsis</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[120px] text-base"
                  placeholder="Provide a brief synopsis of your production"
                  {...field}
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Provide a brief synopsis of your production
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="formData.accommodationBooked"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Accommodation Booked
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder="Select yes or no" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yes" className="text-base">
                      Yes
                    </SelectItem>
                    <SelectItem value="no" className="text-base">
                      No
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {accommodationBooked === "yes" && (
            <FormField
              control={form.control}
              name="formData.numberOfRoomsBooked"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Number of Rooms Booked
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="text-base"
                      placeholder="e.g. 12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
