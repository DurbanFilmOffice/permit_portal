"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form";
import {
  EQUIPMENT_OPTIONS,
  type PermitFormValues,
} from "@/lib/validations/permit-form.schema";

interface Props {
  form: UseFormReturn<PermitFormValues>;
}

export function Step03Equipment({ form }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select all equipment and special requirements that apply to your
        production.
      </p>

      <Controller
        control={form.control}
        name="formData.equipment"
        render={({ field, fieldState }) => (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {EQUIPMENT_OPTIONS.map((option) => {
                const checked = field.value?.includes(option.value) ?? false;

                const handleChange = (isChecked: boolean) => {
                  const current = field.value ?? [];
                  field.onChange(
                    isChecked
                      ? [...current, option.value]
                      : current.filter((v: string) => v !== option.value),
                  );
                };

                return (
                  <div
                    key={option.value}
                    className="flex items-center gap-3 rounded-md border border-input px-4 py-3"
                  >
                    <Checkbox
                      id={`equipment-${option.value}`}
                      checked={checked}
                      onCheckedChange={handleChange}
                    />
                    <Label
                      htmlFor={`equipment-${option.value}`}
                      className="text-base cursor-pointer font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>

            {fieldState.error && (
              <FormMessage>{fieldState.error.message}</FormMessage>
            )}
          </div>
        )}
      />
    </div>
  );
}