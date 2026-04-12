"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  updateProfileSchema,
  type UpdateProfileValues,
} from "@/lib/validations/auth.schema";
import { updateProfileAction } from "@/app/(applicant)/account/actions";

interface ProfileFormProps {
  fullName: string;
  email: string;
}

export default function ProfileForm({ fullName, email }: ProfileFormProps) {
  const router = useRouter();
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { fullName },
  });

  async function onSubmit(values: UpdateProfileValues) {
    setRootError(null);
    const result = await updateProfileAction(values);

    if (result?.error) {
      if (typeof result.error === "string") {
        setRootError(result.error);
      } else {
        setRootError("Failed to update profile");
      }
      return;
    }

    toast.success("Profile updated successfully");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Profile</CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Update your display name
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
            <Label htmlFor="fullName" className="text-base font-medium">
              Full name
            </Label>
            <Input
              id="fullName"
              className="text-base"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">
              Email address
            </Label>
            <Input
              id="email"
              value={email}
              disabled
              className="text-base text-muted-foreground"
            />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="text-base">
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
