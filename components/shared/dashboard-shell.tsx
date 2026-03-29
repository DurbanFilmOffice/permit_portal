'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import type { NavItem, SessionUser } from '@/types'

type DashboardShellProps = {
  navItems: NavItem[]
  user: SessionUser
  title: string
  children: React.ReactNode
}

export function DashboardShell({ navItems, user, title, children }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        navItems={navItems}
        user={user}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(p => !p)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header
          title={title}
          user={user}
          onMobileMenuOpen={() => setIsMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}