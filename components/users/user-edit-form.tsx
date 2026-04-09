"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Role } from "@/lib/validations/roles";
import { ROLES, ROLE_CONFIG } from "@/lib/validations/roles";
import {
  updateUserAction,
  sendPasswordResetAction,
  setTemporaryPasswordAction,
  changeRoleAction,
  deactivateUserAction,
  reactivateUserAction,
} from "@/app/(admin)/admin/users/[id]/actions";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

interface Props {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    isActive: boolean;
  };
  currentUserId: string;
  requestingRole: Role;
}

export default function UserEditForm({
  user,
  currentUserId,
  requestingRole,
}: Props) {
  const router = useRouter();
  const isSelf = user.id === currentUserId;

  // --- Full name state ---
  const [fullName, setFullName] = useState(user.fullName);
  const [savingName, setSavingName] = useState(false);

  // --- Temporary password state ---
  const [tempPassword, setTempPassword] = useState("");
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [savingTempPassword, setSavingTempPassword] = useState(false);

  // --- Reset link state ---
  const [sendingReset, setSendingReset] = useState(false);

  // --- Role state ---
  const [savingRole, setSavingRole] = useState(false);

  // --- Deactivate confirm dialog ---
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

  const isRoleDisabled =
    isSelf || (requestingRole === "admin" && user.role === "super_admin");

  const visibleRoles =
    requestingRole === "super_admin"
      ? ROLES
      : ROLES.filter((r) => r !== "super_admin");

  // --- Handlers ---

  async function handleSaveName() {
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }
    setSavingName(true);
    const result = await updateUserAction(user.id, { fullName });
    setSavingName(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Name updated successfully");
      router.refresh();
    }
  }

  async function handleRoleChange(newRole: Role) {
    setSavingRole(true);
    const result = await changeRoleAction(user.id, newRole);
    setSavingRole(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Role updated successfully");
      router.refresh();
    }
  }

  async function handleSendResetLink() {
    setSendingReset(true);
    const result = await sendPasswordResetAction(user.id);
    setSendingReset(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Password reset link sent to ${user.email}`);
    }
  }

  async function handleSetTempPassword() {
    if (tempPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSavingTempPassword(true);
    const result = await setTemporaryPasswordAction(user.id, tempPassword);
    setSavingTempPassword(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Temporary password set successfully");
      setTempPassword("");
      setShowTempPassword(false);
    }
  }

  async function handleDeactivate() {
    setTogglingActive(true);
    const result = await deactivateUserAction(user.id);
    setTogglingActive(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`${user.fullName}'s account has been deactivated`);
      router.refresh();
    }
  }

  async function handleReactivate() {
    setTogglingActive(true);
    const result = await reactivateUserAction(user.id);
    setTogglingActive(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`${user.fullName}'s account has been reactivated`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-10">
      {/* ── Full name ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Personal details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Update the user's display name.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-base font-medium">
            Full name
          </Label>
          <div className="flex gap-3">
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="text-base max-w-sm"
              placeholder="Full name"
            />
            <Button
              onClick={handleSaveName}
              disabled={savingName || fullName.trim() === user.fullName}
            >
              {savingName ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Role ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Role</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isSelf
              ? "You cannot change your own role."
              : "Change the user's access level."}
          </p>
        </div>
        <Select
          defaultValue={user.role}
          onValueChange={(value) => handleRoleChange(value as Role)}
          disabled={isRoleDisabled || savingRole}
        >
          <SelectTrigger className="w-56 text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {visibleRoles.map((role) => (
              <SelectItem key={role} value={role} className="text-base">
                {ROLE_CONFIG[role].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <Separator />

      {/* ── Password reset ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Password reset</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Send the user a reset link or set a temporary password directly.
          </p>
        </div>

        <div className="space-y-6">
          {/* Send reset link */}
          {/* <div className="space-y-2">
            <p className="text-base font-medium">Send reset link</p>
            <p className="text-sm text-muted-foreground">
              Emails a password reset link to{" "}
              <span className="font-medium">{user.email}</span>. The link
              expires in 1 hour.
            </p>
            <Button
              variant="outline"
              onClick={handleSendResetLink}
              disabled={sendingReset}
            >
              {sendingReset ? "Sending…" : "Send reset link"}
            </Button>
          </div> */}

          <Separator className="max-w-sm" />

          {/* Set temporary password */}
          <div className="space-y-2">
            <p className="text-base font-medium">Set temporary password</p>
            <p className="text-sm text-muted-foreground">
              Directly set a password for this user. They should change it after
              signing in.
            </p>
            <div className="flex gap-3 items-center">
              <Input
                type={showTempPassword ? "text" : "password"}
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="text-base max-w-sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTempPassword((v) => !v)}
                className="text-base"
              >
                {showTempPassword ? "Hide" : "Show"}
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={handleSetTempPassword}
              disabled={savingTempPassword || tempPassword.length === 0}
            >
              {savingTempPassword ? "Saving…" : "Set password"}
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Account status ── */}
      {!isSelf && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Account status</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {user.isActive
                ? "This account is currently active."
                : "This account is currently deactivated."}
            </p>
          </div>
          {user.isActive ? (
            <Button
              variant="outline"
              className="text-base text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950"
              onClick={() => setConfirmDeactivateOpen(true)}
              disabled={togglingActive}
            >
              Deactivate account
            </Button>
          ) : (
            <Button
              variant="outline"
              className="text-base text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={handleReactivate}
              disabled={togglingActive}
            >
              {togglingActive ? "Reactivating…" : "Reactivate account"}
            </Button>
          )}
        </section>
      )}

      {/* ── Deactivate confirm dialog ── */}
      <AlertDialog
        open={confirmDeactivateOpen}
        onOpenChange={setConfirmDeactivateOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              Deactivate account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to deactivate{" "}
              <span className="font-medium">{user.fullName}</span>'s account?
              They will not be able to log in until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-base">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-base bg-amber-600 hover:bg-amber-700"
              onClick={handleDeactivate}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
