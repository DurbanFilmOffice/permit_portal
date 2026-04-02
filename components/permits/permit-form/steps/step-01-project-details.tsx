"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/permits/rich-text-editor";
import type { PermitFormValues } from "@/lib/validations/permit-form.schema";

interface Props {
  form: UseFormReturn<PermitFormValues>;
}

export function Step01ProjectDetails({ form }: Props) {
  const [showDescription, setShowDescription] = useState(false);

  const handleToggleDescription = (checked: boolean) => {
    setShowDescription(checked);
    if (!checked) {
      form.setValue("formData.descriptionOfScenes", "");
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Name */}
      <FormField
        control={form.control}
        name="formData.companyName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Company Name <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Production company name" {...field} />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />

      {/* Project Title */}
      <FormField
        control={form.control}
        name="formData.projectTitle"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Project Title <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Title of the production"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  form.setValue("projectName", e.target.value);
                }}
              />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />

      {/* Start Date */}
      <FormField
        control={form.control}
        name="formData.startDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Start Date <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />

      {/* End Date */}
      <FormField
        control={form.control}
        name="formData.endDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">End Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />

      {/* Description of Scenes — toggle */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Switch
            id="description-toggle"
            checked={showDescription}
            onCheckedChange={handleToggleDescription}
          />
          <Label htmlFor="description-toggle" className="text-base">
            Add description of scenes
          </Label>
        </div>

        {showDescription && (
          <FormField
            control={form.control}
            name="formData.descriptionOfScenes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Description of Scenes
                </FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Describe the scenes to be filmed…"
                  />
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
        )}
      </div>

      {/* Tags */}
      <FormField
        control={form.control}
        name="formData.tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Tags</FormLabel>
            <FormControl>
              <Input placeholder="Comma-separated tags (optional)" {...field} />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
}
