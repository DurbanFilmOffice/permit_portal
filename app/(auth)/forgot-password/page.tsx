'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MailCheck } from 'lucide-react'
import Link from 'next/link'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from '@/lib/validations/auth.schema'
import { forgotPasswordAction } from './actions'

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(values: ForgotPasswordValues) {
    const result = await forgotPasswordAction(values)
    if (result.success) {
      setSubmittedEmail(values.email)
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center gap-4 py-8">
        <MailCheck className="h-12 w-12 text-primary" />
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-muted-foreground max-w-sm">
          If an account exists for <span className="font-medium text-foreground">{submittedEmail}</span>,
          we've sent a password reset link. Check your spam folder if you don't
          see it within a few minutes.
        </p>
        <Link href="/login" className="text-sm text-muted-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Forgot your password?</h1>
        <p className="text-muted-foreground mt-1">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      </Form>

      <Link href="/login" className="text-sm text-center text-muted-foreground underline underline-offset-4">
        Back to sign in
      </Link>
    </div>
  )
}