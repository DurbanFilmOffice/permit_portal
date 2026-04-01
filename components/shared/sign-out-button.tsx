'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SignOutButtonProps {
  variant?: 'default' | 'ghost' | 'icon'
  showIcon?: boolean
  showLabel?: boolean
  className?: string
}

export function SignOutButton({
  variant = 'ghost',
  showIcon = true,
  showLabel = true,
  className,
}: SignOutButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      disabled={loading}
      className={cn('gap-2', className)}
    >
      {showIcon && (
        loading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <LogOut className="h-4 w-4" />
      )}
      {showLabel && 'Sign out'}
    </Button>
  )
}