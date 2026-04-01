import { CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/auth.service'

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams

  let success = false
  let errorMessage = 'The verification link is invalid or has expired.'

  if (token) {
    try {
      await authService.verifyEmail(token)
      success = true
    } catch (err) {
      if (err instanceof Error) {
        errorMessage = err.message
      }
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Email verified!</h1>
          <p className="text-muted-foreground">Your account is now active.</p>
        </div>
        <Button asChild>
          <Link href="/login">Sign in to your account</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-6">
      <div className="flex justify-center">
        <XCircle className="h-16 w-16 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Verification failed</h1>
        <p className="text-muted-foreground">{errorMessage}</p>
      </div>
      <Button variant="outline" asChild>
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  )
}