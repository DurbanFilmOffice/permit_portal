import { DashboardShell } from "@/components/shared/dashboard-shell";
import type { NavItem, SessionUser } from "@/types";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// TODO: Replace with auth() from @/lib/auth once Auth.js is configured
// const mockUser: SessionUser = {
//   id: 'mock-applicant-id',
//   name: 'John Applicant',
//   email: 'john@example.com',
//   role: 'applicant',
// }

const applicantNavItems: NavItem[] = [
  {
    label: "My applications",
    href: "/applications",
    icon: "FileText",
    roles: ["applicant"],
  },
  {
    label: "Account",
    href: "/account",
    icon: "UserCircle",
    roles: ["applicant"],
  },
];

export default async function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user: SessionUser = {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: session.user.role,
  };
  return (
    <DashboardShell
      navItems={applicantNavItems}
      user={user}
      title="My Applications"
    >
      {children}
    </DashboardShell>
  );
}
