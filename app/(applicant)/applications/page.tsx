import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { permitsService } from "@/services/permits.service";
import {
  PERMIT_STATUSES,
  STATUS_CONFIG,
} from "@/lib/validations/permit-status";
import { getPaginationParams, getPaginationMeta } from "@/lib/utils/pagination";
import ApplicationsTable from "@/components/permits/applications-table";
import TableToolbar from "@/components/shared/data-table/table-toolbar";
import SearchInput from "@/components/shared/data-table/search-input";
import FilterSelect from "@/components/shared/data-table/filter-select";
import PageSizeSelect from "@/components/shared/data-table/page-size-select";
import PaginationControls from "@/components/shared/data-table/pagination-controls";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const { page, pageSize, offset } = getPaginationParams(params);

  const filters = {
    search: params.search,
    status: params.status,
  };

  const { rows, total } = await permitsService.getFilteredUserPermits(
    session.user.id,
    filters,
    { limit: pageSize, offset },
  );

  const meta = getPaginationMeta(total, page, pageSize);

  const statusOptions = PERMIT_STATUSES.map((s) => ({
    value: s,
    label: STATUS_CONFIG[s].label,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My Applications
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            View and manage your permit applications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PageSizeSelect />
          <Button asChild>
            <Link href="/applications/new">
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-base">New application</span>
            </Link>
          </Button>
        </div>
      </div>

      <TableToolbar>
        <SearchInput placeholder="Search by project name..." />
        <FilterSelect
          paramName="status"
          placeholder="All statuses"
          options={statusOptions}
        />
      </TableToolbar>

      <ApplicationsTable permits={rows} />

      <PaginationControls meta={meta} />
    </div>
  );
}
