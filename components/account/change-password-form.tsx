"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/lib/validations/auth.schema";
import { changePasswordAction } from "@/app/(applicant)/account/actions";

function PasswordInput({
  id,
  ...props
}: React.ComponentProps<typeof Input> & { id: string }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        className="text-base pr-10"
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function ChangePasswordForm() {
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(values: ChangePasswordValues) {
    setRootError(null);
    const result = await changePasswordAction(values);

    if (!result.success) {
      setRootError(result.error);
      return;
    }

    toast.success("Password changed successfully");
    reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Security</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Change your password
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {rootError && (
            <Alert variant="destructive">
              <AlertDescription className="text-base">
                {rootError}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-base font-medium">
              Current password
            </Label>
            <PasswordInput
              id="currentPassword"
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-base font-medium">
              New password
            </Label>
            <PasswordInput id="newPassword" {...register("newPassword")} />
            <p className="text-sm text-muted-foreground">
              At least 8 characters, one uppercase, one number
            </p>
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-base font-medium">
              Confirm new password
            </Label>
            <PasswordInput
              id="confirmPassword"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="text-base">
            {isSubmitting ? "Saving…" : "Change password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
