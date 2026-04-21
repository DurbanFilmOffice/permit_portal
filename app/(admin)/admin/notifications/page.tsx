import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { notificationRecipientsService } from "@/services/notification-recipients.service";
import { usersService } from "@/services/users.service";
import { getPaginationParams, getPaginationMeta } from "@/lib/utils/pagination";
import RecipientsTable from "@/components/notifications/recipients-table";
import AddRecipientForm from "@/components/notifications/add-recipient-form";
import TableToolbar from "@/components/shared/data-table/table-toolbar";
import SearchInput from "@/components/shared/data-table/search-input";
import FilterSelect from "@/components/shared/data-table/filter-select";
import PageSizeSelect from "@/components/shared/data-table/page-size-select";
import PaginationControls from "@/components/shared/data-table/pagination-controls";

export default async function NotificationsConfigPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!["admin", "super_admin"].includes(session.user.role)) {
    redirect("/admin/dashboard");
  }

  const params = await searchParams;
  const { page, pageSize, offset } = getPaginationParams(params);

  const filters = {
    search: params.search,
    status: params.status,
  };

  const [{ rows, total }, allRecipients, allUsers] = await Promise.all([
    notificationRecipientsService.getFiltered(filters, {
      limit: pageSize,
      offset,
    }),
    // Fetch all recipients unfiltered for the banner count + available users
    notificationRecipientsService.getAll(),
    usersService.getAll(),
  ]);

  const meta = getPaginationMeta(total, page, pageSize);

  // Always show system-wide active count regardless of current filter
  const activeCount = allRecipients.filter((r) => r.isActive).length;

  // Only offer active internal users who are not already recipients
  const existingUserIds = new Set(
    allRecipients.map((r) => r.userId).filter(Boolean),
  );
  const internalRoles = [
    "permit_officer",
    "permit_admin",
    "admin",
    "super_admin",
  ];
  const availableUsers = allUsers.filter(
    (u) =>
      u.isActive &&
      internalRoles.includes(u.role) &&
      !existingUserIds.has(u.id),
  );

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <div className="space-y-8 max-w-8xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Notification Recipients
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          Manage who receives email alerts when new permit applications are
          submitted.
        </p>
      </div>

      {/* Summary banner — always shows system-wide active count */}
      <div className="rounded-lg border bg-muted/50 p-4 flex items-center gap-3">
        <Bell className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <p className="text-base text-muted-foreground">
          <span className="font-medium text-foreground">
            {activeCount} active recipient{activeCount !== 1 ? "s" : ""}
          </span>{" "}
          will receive an email when a new permit application is submitted.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Add form — 1/3 width */}
        <div className="lg:col-span-1">
          <AddRecipientForm availableUsers={availableUsers} />
        </div>

        {/* Recipients table — 2/3 width */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border">
            <div className="p-4 border-b space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Current Recipients</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {total} total recipient{total !== 1 ? "s" : ""}
                  </p>
                </div>
                <PageSizeSelect />
              </div>
              <TableToolbar>
                <SearchInput placeholder="Search by name or email..." />
                <FilterSelect
                  paramName="status"
                  placeholder="All statuses"
                  options={statusOptions}
                />
              </TableToolbar>
            </div>

            <RecipientsTable recipients={rows} />

            {rows.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-base text-muted-foreground">
                  No recipients match your search
                </p>
              </div>
            )}

            <div className="p-4 border-t">
              <PaginationControls meta={meta} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
