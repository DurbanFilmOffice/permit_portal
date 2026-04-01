import { MailCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CheckEmailPage() {
  return (
    <div className="w-full max-w-md mx-auto text-center space-y-6">
      <div className="flex justify-center">
        <MailCheck className="h-16 w-16 text-primary" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-muted-foreground">
          We've sent a verification link to your email address.
          Click the link in the email to activate your account.
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        Didn't receive it? Check your spam folder.
      </p>

      <Button variant="outline" asChild>
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  )
}