"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/permits/rich-text-editor";
import type { PermitFormValues } from "@/lib/validations/permit-form.schema";

interface Props {
  form: UseFormReturn<PermitFormValues>;
}

export function Step06Drone({ form }: Props) {
  return (
    <div className="space-y-6">
      {/* Proposed Activity Details */}
      <FormField
        control={form.control}
        name="formData.proposedActivityDetails"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Proposed Activity Details
            </FormLabel>
            <FormControl>
              <RichTextEditor
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Describe the proposed drone activity…"
              />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />

      {/* Drone Operator Has License */}
      <FormField
        control={form.control}
        name="formData.droneOperatorHasLicense"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Does the drone operator have a valid license?{" "}
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
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />

      {/* Drone Proposed Activity Details */}
      <FormField
        control={form.control}
        name="formData.droneProposedActivityDetails"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Drone Proposed Activity Details
            </FormLabel>
            <FormControl>
              <RichTextEditor
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Additional details about the drone activity…"
              />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
}
