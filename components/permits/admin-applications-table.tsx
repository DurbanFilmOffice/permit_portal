"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/permits/status-badge";
import Link from "next/link";

type PermitRow = {
  id: string;
  userId: string;
  projectName: string;
  siteAddress: string;
  status: string;
  submittedAt: Date | null;
  createdAt: Date;
  formData: unknown;
  applicant: {
    id: string;
    fullName: string;
    email: string;
  } | null;
};

interface AdminApplicationsTableProps {
  rows: PermitRow[];
  linkPrefix?: string;
}

const columnHelper = createColumnHelper<PermitRow>();

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getGenre(formData: unknown): string {
  if (!formData || typeof formData !== "object") return "—";
  const fd = formData as Record<string, unknown>;
  if (!fd.genre || typeof fd.genre !== "string") return "—";
  return fd.genre.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminApplicationsTable({
  rows,
  linkPrefix = "/admin/applications",
}: AdminApplicationsTableProps) {
  const columns = [
    columnHelper.accessor("id", {
      header: "Reference",
      cell: (info) => (
        <span className="font-mono text-base">
          {info.getValue().slice(0, 8).toUpperCase()}
        </span>
      ),
    }),
    columnHelper.accessor("projectName", {
      header: "Project",
      cell: (info) => (
        <div>
          <p className="text-base font-medium">{info.getValue()}</p>
          {info.row.original.applicant && (
            <p className="text-sm text-muted-foreground">
              {info.row.original.applicant.fullName}
            </p>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("formData", {
      header: "Type",
      cell: (info) => (
        <span className="text-base">{getGenre(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("submittedAt", {
      header: "Submitted",
      cell: (info) => (
        <span className="text-base">{formatDate(info.getValue())}</span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <Button variant="outline" size="sm" asChild>
          <Link href={`${linkPrefix}/${info.row.original.id}`}>View</Link>
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border">
        <FileSearch className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold mt-4">No applications found</p>
        <p className="text-base text-muted-foreground mt-2">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-base font-medium">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
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
