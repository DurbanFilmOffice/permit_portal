import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { usersService } from "@/services/users.service";
import type { Role } from "@/lib/validations/roles";
import UserRoleSelect from "@/components/users/user-role-select";
import UserActionsMenu from "@/components/users/user-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users } from "lucide-react";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!["admin", "super_admin"].includes(session.user.role)) {
    redirect("/admin/dashboard");
  }

  const users = await usersService.getApplicants();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Applicants</h1>
          <p className="text-base text-muted-foreground mt-1">
            Users who have registered to submit permit applications.
          </p>
        </div>
        {/* <Button variant="outline" asChild>
          <Link href="/admin/users/">
            <Users className="h-4 w-4 mr-2" />
            <span className="text-base">Applicant</span>
          </Link>
        </Button> */}
      </div>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 text-base font-medium">User</th>
              <th className="text-left p-4 text-base font-medium">Status</th>
              <th className="text-left p-4 text-base font-medium">Joined</th>
              <th className="text-left p-4 text-base font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0">
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
                    isActive={user.isActive}
                    currentUserId={session.user.id}
                    requestingRole={session.user.role as Role}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-base text-muted-foreground">
              No applicants found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
