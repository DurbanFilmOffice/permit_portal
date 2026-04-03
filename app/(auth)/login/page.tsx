"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { getSession } from "next-auth/react";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { loginSchema, type LoginValues } from "@/lib/validations/auth.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Role } from "@/lib/validations/roles";

function getRedirectUrl(role: Role): string {
  if (role === "applicant") return "/applications";
  if (role === "external_user") return "/admin/applications";
  return "/admin/dashboard";
}

function getErrorMessage(error: string): string {
  if (error === "CredentialsSignin") return "Invalid email or password";
  if (error) return error;
  return "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: LoginValues) {
    setError(null);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (!result || result.error) {
      setError(getErrorMessage(result?.error ?? ""));
      return;
    }

    const session = await getSession();
    const role = session?.user?.role as Role | undefined;
    router.push(getRedirectUrl(role ?? "applicant"));
  }

  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Left — full-bleed image panel */}
      <div className="relative hidden lg:block h-full">
        <Image
          src="https://images.unsplash.com/photo-1656776832783-c1671a7ad521?q=80"
          alt="City architecture"
          fill
          sizes="50vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-3xl font-semibold leading-snug">
            Building a better city,
            <br />
            one permit at a time.
          </p>
          <p className="mt-3 text-sm text-white/70">
            eThekwini Municipality · Permit Portal
          </p>
        </div>
      </div>

      {/* Right — centered form panel */}
      <div className="h-full flex items-center justify-center px-6 py-12 overflow-y-auto bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-base text-muted-foreground">
              Enter your details to continue
            </p>
          </div>

          {resetSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Password reset successfully. You can now sign in with your new
                password.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Form>

          <div className="space-y-2 text-center text-base">
            <div>
              <Link
                href="/forgot-password"
                className="text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium underline-offset-4 hover:underline"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
