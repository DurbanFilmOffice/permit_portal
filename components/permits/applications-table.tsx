"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronUp, ChevronDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/permits/status-badge";
import type { Permit } from "@/db/schema/permits";

function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPermitType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ");
}

const columns: ColumnDef<Permit>[] = [
  {
    id: "reference",
    accessorFn: (row) => row.id.slice(0, 8).toUpperCase(),
    header: () => <span className="text-base font-medium">Ref #</span>,
    cell: ({ getValue }) => (
      <span className="font-mono text-base">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "projectName",
    header: () => <span className="text-base font-medium">Project</span>,
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "permitType",
    header: () => <span className="text-base font-medium">Type</span>,
    cell: ({ getValue }) => formatPermitType(getValue<string>()),
  },
  {
    accessorKey: "status",
    header: () => <span className="text-base font-medium">Status</span>,
    cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
  },
  {
    accessorKey: "submittedAt",
    header: () => <span className="text-base font-medium">Submitted</span>,
    cell: ({ getValue }) => formatDate(getValue<Date | string | null>()),
  },
  {
    id: "actions",
    header: () => <span className="text-base font-medium">View</span>,
    enableSorting: false,
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/applications/${row.original.id}`}>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
];

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") return <ChevronUp className="ml-1 h-3 w-3 inline" />;
  if (isSorted === "desc")
    return <ChevronDown className="ml-1 h-3 w-3 inline" />;
  return (
    <ChevronUp className="ml-1 h-3 w-3 inline opacity-0 group-hover:opacity-40" />
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
      <FileText className="h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-semibold mt-4">No applications yet</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Submit your first permit application to get started
      </p>
      <Button asChild className="mt-4">
        <Link href="/applications/new">Submit application</Link>
      </Button>
    </div>
  );
}

export default function ApplicationsTable({ permits }: { permits: Permit[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: permits,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (permits.length === 0) return <EmptyState />;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                return (
                  <TableHead
                    key={header.id}
                    className={
                      canSort ? "group cursor-pointer select-none" : ""
                    }
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {canSort && (
                      <SortIcon isSorted={header.column.getIsSorted()} />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="text-base">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ApplicationsTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {["Ref #", "Project", "Type", "Status", "Submitted", "View"].map(
              (col) => (
                <TableHead key={col}>
                  <span className="text-base font-medium">{col}</span>
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-md" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
