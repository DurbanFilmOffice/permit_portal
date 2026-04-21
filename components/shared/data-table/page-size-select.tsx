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
import { PAGE_SIZES, DEFAULT_PAGE_SIZE } from "@/lib/utils/pagination";

export default function PageSizeSelect() {
  const [, startTransition] = useTransition();
  const [pageSize, setPageSize] = useQueryState("pageSize", { shallow: false });
  const [, setPage] = useQueryState("page");

  const handleChange = (value: string) => {
    startTransition(() => {
      setPageSize(value === String(DEFAULT_PAGE_SIZE) ? null : value);
      setPage(null);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Rows per page
      </span>
      <Select
        value={pageSize ?? String(DEFAULT_PAGE_SIZE)}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-20 text-base">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZES.map((size) => (
            <SelectItem key={size} value={String(size)} className="text-base">
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
