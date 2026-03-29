import { DashboardShell } from '@/components/shared/dashboard-shell'
import type { NavItem, SessionUser } from '@/types'

// TODO: Replace with auth() from @/lib/auth once Auth.js is configured
const mockUser: SessionUser = {
  id: 'mock-applicant-id',
  name: 'John Applicant',
  email: 'john@example.com',
  role: 'applicant',
}

const applicantNavItems: NavItem[] = [
  {
    label: 'My applications',
    href: '/applications',
    icon: 'FileText',
    roles: ['applicant'],
  },
  {
    label: 'Account',
    href: '/account',
    icon: 'UserCircle',
    roles: ['applicant'],
  },
]

export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell
      navItems={applicantNavItems}
      user={mockUser}
      title="My Applications"
    >
      {children}
    </DashboardShell>
  )
}