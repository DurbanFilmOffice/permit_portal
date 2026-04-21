import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { usersService } from "@/services/users.service";
import { ROLES, ROLE_CONFIG } from "@/lib/validations/roles";
import { getPaginationParams, getPaginationMeta } from "@/lib/utils/pagination";
import type { Role } from "@/lib/validations/roles";
import UserActionsMenu from "@/components/users/user-actions-menu";
import TableToolbar from "@/components/shared/data-table/table-toolbar";
import SearchInput from "@/components/shared/data-table/search-input";
import FilterSelect from "@/components/shared/data-table/filter-select";
import PageSizeSelect from "@/components/shared/data-table/page-size-select";
import PaginationControls from "@/components/shared/data-table/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function InternalUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!["permit_admin", "admin", "super_admin"].includes(session.user.role)) {
    redirect("/admin/dashboard");
  }

  const params = await searchParams;
  const { page, pageSize, offset } = getPaginationParams(params);

  const filters = {
    search: params.search,
    role: params.role,
    status: params.status,
  };

  const { rows, total } = await usersService.getFilteredUsers(filters, {
    limit: pageSize,
    offset,
  });

  const meta = getPaginationMeta(total, page, pageSize);

  const roleOptions = ROLES.map((r) => ({
    value: r,
    label: ROLE_CONFIG[r].label,
  }));

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const currentUserId = session.user.id;
  const requestingRole = session.user.role as Role;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Administrative users
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Staff accounts with access to the admin portal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PageSizeSelect />
          <Button asChild>
            <Link href="/admin/users/internal/new">
              <Plus className="h-4 w-4 mr-2" />
              <span className="text-base">New user</span>
            </Link>
          </Button>
        </div>
      </div>

      <TableToolbar>
        <SearchInput placeholder="Search by name or email..." />
        <FilterSelect
          paramName="role"
          placeholder="All roles"
          options={roleOptions}
        />
        <FilterSelect
          paramName="status"
          placeholder="All statuses"
          options={statusOptions}
        />
      </TableToolbar>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 text-base font-medium">User</th>
              <th className="text-left p-4 text-base font-medium">Role</th>
              <th className="text-left p-4 text-base font-medium">Status</th>
              <th className="text-left p-4 text-base font-medium">Joined</th>
              <th className="text-left p-4 text-base font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((user) => (
              <tr
                key={user.id}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                {/* User column */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-base font-medium flex-shrink-0">
                      {user.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-base font-medium">{user.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Role column — read only */}
                <td className="p-4 text-base text-muted-foreground">
                  {ROLE_CONFIG[user.role as Role].label}
                </td>

                {/* Status column */}
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <Badge
                      className={
                        user.isActive
                          ? "bg-green-500/15 text-green-600 dark:text-green-400"
                          : "bg-red-500/15 text-red-600 dark:text-red-400"
                      }
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {!user.emailVerified && (
                      <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        Unverified
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Joined column */}
                <td className="p-4 text-base text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                {/* Actions column */}
                <td className="p-4">
                  <UserActionsMenu
                    userId={user.id}
                    fullName={user.fullName}
                    isActive={user.isActive ?? true}
                    currentUserId={currentUserId}
                    requestingRole={requestingRole}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-base text-muted-foreground">
              No users found matching your filters
            </p>
          </div>
        )}
      </div>

      <PaginationControls meta={meta} />
    </div>
  );
}
