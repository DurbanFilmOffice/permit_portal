"use client";

import { useController } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type PermitFormValues,
  EQUIPMENT_OPTIONS,
} from "@/lib/validations/permit-form.schema";

interface Step06SpecialRequirementsProps {
  form: UseFormReturn<PermitFormValues>;
}

export function Step06SpecialRequirements({
  form,
}: Step06SpecialRequirementsProps) {
  const { field } = useController({
    control: form.control,
    name: "formData.equipment",
  });

  const selected: string[] = field.value ?? [];

  function toggle(value: string) {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    field.onChange(next);
  }

  return (
    <div>
      {/* ── Section heading ──────────────────────────────────── */}
      <h2 className="text-xl font-semibold mb-2">Special Requirements</h2>
      <p className="text-base text-muted-foreground mb-6">
        Select any special requirements your production needs. This section is
        optional.
      </p>

      {/* ── Equipment checkboxes ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {EQUIPMENT_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <Checkbox
              checked={selected.includes(option.value)}
              onCheckedChange={() => toggle(option.value)}
              id={`equipment-${option.value}`}
            />
            <span className="text-base">{option.label}</span>
          </label>
        ))}
      </div>

      {selected.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          No special requirements selected
        </p>
      )}
    </div>
  );
}
