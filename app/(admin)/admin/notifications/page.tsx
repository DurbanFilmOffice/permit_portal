import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";

import { notificationRecipientsService } from "@/services/notification-recipients.service";
import { usersService } from "@/services/users.service";
import RecipientsTable from "@/components/notifications/recipients-table";
import AddRecipientForm from "@/components/notifications/add-recipient-form";

export default async function NotificationsConfigPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!["admin", "super_admin"].includes(session.user.role)) {
    redirect("/admin/dashboard");
  }

  const [recipients, allUsers] = await Promise.all([
    notificationRecipientsService.getAll(),
    usersService.getAll(),
  ]);

  const activeCount = recipients.filter((r) => r.isActive).length;

  // Only offer active internal users who are not already recipients
  const existingUserIds = new Set(
    recipients.map((r) => r.userId).filter(Boolean),
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

      {/* Summary banner */}
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
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Current Recipients</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {recipients.length} total recipient
                {recipients.length !== 1 ? "s" : ""}
              </p>
            </div>
            <RecipientsTable recipients={recipients} />
          </div>
        </div>
      </div>
    </div>
  );
}
