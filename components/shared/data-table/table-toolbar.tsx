"use client";

import type { ReactNode } from "react";

interface TableToolbarProps {
  children: ReactNode;
}

export default function TableToolbar({ children }: TableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">{children}</div>
  );
}
