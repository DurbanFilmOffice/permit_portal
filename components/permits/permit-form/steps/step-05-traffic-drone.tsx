"use client";

import type { UseFormReturn } from "react-hook-form";
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
import type { PermitFormValues } from "@/lib/validations/permit-form.schema";

interface Props {
  form: UseFormReturn<PermitFormValues>;
}

export function Step05TrafficDrone({ form }: Props) {
  const requiresTrafficControl = form.watch("formData.requiresTrafficControl");

  return (
    <div className="space-y-6">
      {/* Requires Traffic Control */}
      <FormField
        control={form.control}
        name="formData.requiresTrafficControl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Requires Traffic Control{" "}
              <span className="text-destructive">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Conditional traffic control fields */}
      {requiresTrafficControl === "yes" && (
        <div className="space-y-6 rounded-md border border-input p-4">
          <p className="text-sm font-medium">Traffic Control Details</p>

          <FormField
            control={form.control}
            name="formData.roadIntersectionName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Road / Intersection Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Name of road or intersection"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formData.dateTrafficControlRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Traffic Control Required</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="formData.trafficControlStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Traffic Control Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                  <FormLabel>Traffic Control End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="formData.trafficStartTimeAndWrapTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Traffic Control Start &amp; Wrap Time</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 06:00 – 18:00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Involve Drone Filming — controls whether Step 6 appears */}
      <FormField
        control={form.control}
        name="formData.involveDroneFilming"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Does the production involve drone filming?{" "}
              <span className="text-destructive">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
            {field.value === "yes" && (
              <p className="text-xs text-muted-foreground mt-1">
                A Drone Filming step will be added to your application.
              </p>
            )}
          </FormItem>
        )}
      />
    </div>
  );
}
