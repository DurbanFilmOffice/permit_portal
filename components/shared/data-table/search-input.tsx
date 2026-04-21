"use client";

import { useQueryState } from "nuqs";
import { useTransition, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  placeholder?: string;
  paramName?: string;
}

export default function SearchInput({
  placeholder = "Search...",
  paramName = "search",
}: SearchInputProps) {
  const [, startTransition] = useTransition();
  const [search, setSearch] = useQueryState(paramName, {
    shallow: false,
    defaultValue: "",
  });
  const [, setPage] = useQueryState("page");

  // Local state for immediate input feedback — synced to URL after debounce
  const [localValue, setLocalValue] = useState(search ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      startTransition(() => {
        setSearch(localValue || null);
        setPage(null);
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [localValue]);

  // Keep local value in sync if URL param changes externally (e.g. browser back)
  useEffect(() => {
    setLocalValue(search ?? "");
  }, [search]);

  const handleClear = () => {
    setLocalValue("");
    startTransition(() => {
      setSearch(null);
      setPage(null);
    });
  };

  return (
    <div className="relative w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 text-base"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
