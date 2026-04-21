"use client";

import { useQueryState } from "nuqs";
import { useTransition } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DateRangeFilterProps {
  fromParam?: string;
  toParam?: string;
}

export default function DateRangeFilter({
  fromParam = "from",
  toParam = "to",
}: DateRangeFilterProps) {
  const [, startTransition] = useTransition();
  const [from, setFrom] = useQueryState(fromParam, { shallow: false });
  const [to, setTo] = useQueryState(toParam, { shallow: false });
  const [, setPage] = useQueryState("page");

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || null;
    startTransition(() => {
      setFrom(value);
      // If new from is after current to, clear to
      if (value && to && value > to) {
        setTo(null);
      }
      setPage(null);
    });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || null;
    startTransition(() => {
      setTo(value);
      setPage(null);
    });
  };

  const handleClear = () => {
    startTransition(() => {
      setFrom(null);
      setTo(null);
      setPage(null);
    });
  };

  const hasValues = from || to;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground whitespace-nowrap">
          From
        </label>
        <Input
          type="date"
          value={from ?? ""}
          onChange={handleFromChange}
          className="w-40 text-base"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground whitespace-nowrap">
          To
        </label>
        <Input
          type="date"
          value={to ?? ""}
          onChange={handleToChange}
          min={from ?? undefined}
          className="w-40 text-base"
        />
      </div>
      {hasValues && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground px-2"
          type="button"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear dates</span>
        </Button>
      )}
    </div>
  );
}
