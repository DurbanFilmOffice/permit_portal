'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RootError({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md text-center space-y-6">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />

        <h1 className="text-2xl font-semibold">Something went wrong</h1>

        <p className="text-base text-muted-foreground">
          An unexpected error occurred. Please try again. If the problem
          persists please contact support.
        </p>

        {error.digest && (
          <p className="text-sm text-muted-foreground font-mono">
            Error reference: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => router.push('/')}>
            Go to home
          </Button>
        </div>
      </div>
    </div>
  )
}