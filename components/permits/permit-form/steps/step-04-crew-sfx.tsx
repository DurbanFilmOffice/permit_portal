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

export function Step04CrewSfx({ form }: Props) {
  const requiresSfx = form.watch("formData.requiresSfxPermit");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Number of Crew */}
        <FormField
          control={form.control}
          name="formData.numberOfCrew"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Number of Crew
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
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
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        {/* Number of Cars */}
        <FormField
          control={form.control}
          name="formData.numberOfCars"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Number of Cars
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
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
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        {/* Number of Cast */}
        <FormField
          control={form.control}
          name="formData.numberOfCast"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Number of Cast
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. 4 principal + 12 supporting"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        {/* Number of Extras */}
        <FormField
          control={form.control}
          name="formData.numberOfExtras"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Number of Extras
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. 50" {...field} />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>

      {/* Requires SFX Permit */}
      <FormField
        control={form.control}
        name="formData.requiresSfxPermit"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Requires SFX Permit <span className="text-destructive">*</span>
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

      {/* Conditional SFX fields */}
      {requiresSfx === "yes" && (
        <div className="space-y-6 rounded-md border border-input p-4">
          <p className="text-base font-medium">SFX Details</p>

          <FormField
            control={form.control}
            name="formData.gunSupervisorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Gun Supervisor Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Full name" {...field} />
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formData.sfxGunSupervisorContact"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Gun Supervisor Contact
                </FormLabel>
                <FormControl>
                  <Input placeholder="Phone or email" {...field} />
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formData.initiationDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Initiation Details
                </FormLabel>
                <FormControl>
                  <Input placeholder="Details of initiation" {...field} />
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="formData.numberOfRounds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Number of Rounds
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 20" {...field} />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formData.numberOfResets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Number of Resets
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 3" {...field} />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
