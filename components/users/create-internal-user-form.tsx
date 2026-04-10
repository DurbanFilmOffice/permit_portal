"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Role } from "@/lib/validations/roles";
import { ROLES, ROLE_CONFIG } from "@/lib/validations/roles";
import { createInternalUserAction } from "@/app/(admin)/admin/users/internal/new/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Props {
  requestingRole: Role;
}

const internalRoles = [
  "external_user",
  "permit_officer",
  "permit_admin",
  "admin",
  "super_admin",
] as const;

export default function CreateInternalUserForm({ requestingRole }: Props) {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("permit_officer");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Admins cannot assign super_admin
  const visibleRoles = internalRoles.filter((r) =>
    requestingRole === "super_admin" ? true : r !== "super_admin",
  );

  function validate() {
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("A valid email address is required");
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setSubmitting(true);
    const result = await createInternalUserAction({
      fullName,
      email,
      role,
      temporaryPassword: password,
    });
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`${fullName}'s account has been created`);
      router.push(`/admin/users/${result.userId}`);
    }
  }

  return (
    <div className="space-y-10 border rounded-md bg-card p-3">
      {/* ── Personal details ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Personal details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Basic information for the new account.
          </p>
        </div>
        <div className="space-y-4 max-w-sm">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-base font-medium">
              Full name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jane Smith"
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-medium">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jane@permits.gov.za"
              className="text-base"
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Role ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Role</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Set the user's access level in the portal.
          </p>
        </div>
        <Select value={role} onValueChange={(value) => setRole(value as Role)}>
          <SelectTrigger className="w-56 text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {visibleRoles.map((r) => (
              <SelectItem key={r} value={r} className="text-base">
                {ROLE_CONFIG[r].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <Separator />

      {/* ── Temporary password ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Temporary password</h2>
          <p className="text-sm text-muted-foreground mt-1">
            The user should change this after their first sign in.
          </p>
        </div>
        <div className="space-y-2 max-w-sm">
          <Label htmlFor="password" className="text-base font-medium">
            Password
          </Label>
          <div className="flex gap-3 items-center">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="text-base"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword((v) => !v)}
              className="text-base shrink-0"
            >
              {showPassword ? "Hide" : "Show"}
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Submit ── */}
      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Creating…" : "Create user"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/users/internal")}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
