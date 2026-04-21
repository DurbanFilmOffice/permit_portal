import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { permitsService } from "@/services/permits.service";
import { isInternalRole } from "@/lib/validations/roles";
import { getPaginationParams, getPaginationMeta } from "@/lib/utils/pagination";
import {
  PERMIT_STATUSES,
  STATUS_CONFIG,
} from "@/lib/validations/permit-status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminApplicationsTable from "@/components/permits/admin-applications-table";
import TableToolbar from "@/components/shared/data-table/table-toolbar";
import SearchInput from "@/components/shared/data-table/search-input";
import FilterSelect from "@/components/shared/data-table/filter-select";
import DateRangeFilter from "@/components/shared/data-table/date-range-filter";
import PageSizeSelect from "@/components/shared/data-table/page-size-select";
import PaginationControls from "@/components/shared/data-table/pagination-controls";
import type { Role } from "@/lib/validations/roles";

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isInternalRole(session.user.role as Role)) {
    redirect("/applications");
  }

  const params = await searchParams;
  const tab = params.tab === "mine" ? "mine" : "all";
  const { page, pageSize, offset } = getPaginationParams(params);

  const filters = {
    search: params.search,
    status: params.status,
    from: params.from,
    to: params.to,
    tab,
  };

  const { rows, total } = await permitsService.getFilteredPermits(
    filters,
    { limit: pageSize, offset },
    session.user.id,
  );

  const meta = getPaginationMeta(total, page, pageSize);

  const statusOptions = PERMIT_STATUSES.map((s) => ({
    value: s,
    label: STATUS_CONFIG[s].label,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="text-base text-muted-foreground mt-1">
          Review and manage permit applications
        </p>
      </div>

      <Tabs defaultValue={tab}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <TabsList className="w-fit gap-1 p-1">
            <TabsTrigger
              value="all"
              className="text-base px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              asChild
            >
              <a href="?tab=all&page=1">All Applications</a>
            </TabsTrigger>
            <TabsTrigger
              value="mine"
              className="text-base px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              asChild
            >
              <a href="?tab=mine&page=1">My Applications</a>
            </TabsTrigger>
          </TabsList>
          <PageSizeSelect />
        </div>

        <TableToolbar>
          <SearchInput placeholder="Search by reference, project, applicant,..." />
          <FilterSelect
            paramName="status"
            placeholder="All statuses"
            options={statusOptions}
          />
          <DateRangeFilter />
        </TableToolbar>

        <TabsContent value="all" className="mt-0">
          <AdminApplicationsTable
            rows={rows}
            linkPrefix="/admin/applications"
          />
          <div className="mt-4">
            <PaginationControls meta={meta} />
          </div>
        </TabsContent>

        <TabsContent value="mine" className="mt-0">
          <AdminApplicationsTable
            rows={rows}
            linkPrefix="/admin/applications"
          />
          <div className="mt-4">
            <PaginationControls meta={meta} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
