"use client";

import { useQueryState } from "nuqs";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSelectProps {
  paramName: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  className?: string;
}

export default function FilterSelect({
  paramName,
  placeholder,
  options,
  className,
}: FilterSelectProps) {
  const [, startTransition] = useTransition();
  const [value, setValue] = useQueryState(paramName, { shallow: false });
  const [, setPage] = useQueryState("page");

  const handleChange = (selected: string) => {
    startTransition(() => {
      setValue(selected === "all" ? null : selected);
      setPage(null);
    });
  };

  return (
    <Select value={value ?? "all"} onValueChange={handleChange}>
      <SelectTrigger className={`w-48 text-base ${className ?? ""}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all" className="text-base">
          {placeholder}
        </SelectItem>
        {options.map((option) => (
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
  );
}
