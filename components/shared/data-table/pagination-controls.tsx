"use client";

import { useQueryState } from "nuqs";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/utils/pagination";

interface PaginationControlsProps {
  meta: PaginationMeta;
}

export default function PaginationControls({ meta }: PaginationControlsProps) {
  const [, startTransition] = useTransition();
  const [page, setPage] = useQueryState("page", { shallow: false });

  const currentPage = page ? parseInt(page) : 1;

  const handlePrev = () => {
    startTransition(() => {
      setPage(currentPage <= 2 ? null : String(currentPage - 1));
    });
  };

  const handleNext = () => {
    startTransition(() => {
      setPage(String(currentPage + 1));
    });
  };

  return (
    <div className="flex items-center justify-between">
      {/* Left: results count */}
      <p className="text-base text-muted-foreground">
        {meta.total === 0 ? (
          "No results found"
        ) : (
          <>
            Showing {meta.from}–{meta.to} of {meta.total}{" "}
            {meta.total === 1 ? "result" : "results"}
          </>
        )}
      </p>

      {/* Right: prev / page indicator / next */}
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={!meta.hasPrev}
          type="button"
        >
          Previous
        </Button>
        <span className="text-base text-muted-foreground px-4">
          Page {currentPage} of {meta.totalPages === 0 ? 1 : meta.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!meta.hasNext}
          type="button"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
