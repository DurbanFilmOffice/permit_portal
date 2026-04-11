import { DashboardShell } from "@/components/shared/dashboard-shell";
import type { NavItem, SessionUser } from "@/types";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isInternalRole } from "@/lib/validations/roles";

const adminNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "LayoutDashboard",
    roles: ["permit_officer", "admin", "permit_admin", "super_admin"],
  },
  {
    label: "Applications",
    href: "/admin/applications",
    icon: "FileStack",
    roles: ["permit_officer", "admin", "permit_admin", "super_admin"],
  },
  {
    label: "Applicants",
    href: "/admin/users",
    icon: "Users",
    roles: ["admin", "permit_admin", "super_admin"],
  },
  {
    label: "Administrative users",
    href: "/admin/users/internal",
    icon: "UserCog",
    roles: ["admin", "permit_admin", "super_admin"],
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: "Bell",
    roles: ["admin", "super_admin"],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "Settings",
    roles: ["super_admin"],
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!isInternalRole(session.user.role)) redirect("/applications");

  const user: SessionUser = {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: session.user.role,
  };

  return (
    <DashboardShell navItems={adminNavItems} user={user} title="Dashboard">
      {children}
    </DashboardShell>
  );
}
