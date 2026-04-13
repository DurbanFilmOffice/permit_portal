"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { changeRoleAction } from "@/app/(admin)/admin/users/actions";
import { ROLES, ROLE_CONFIG } from "@/lib/validations/roles";
import type { Role } from "@/lib/validations/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserRoleSelectProps {
  userId: string;
  currentRole: Role;
  currentUserId: string;
  requestingRole: Role;
}

export default function UserRoleSelect({
  userId,
  currentRole,
  currentUserId,
  requestingRole,
}: UserRoleSelectProps) {
  const router = useRouter();

  // Disabled if viewing own row, or if admin trying to change a super_admin
  const isDisabled =
    userId === currentUserId ||
    (requestingRole === "admin" && currentRole === "super_admin");

  // Admins cannot see or assign super_admin
  const visibleRoles =
    requestingRole === "super_admin"
      ? ROLES
      : ROLES.filter((r) => r !== "super_admin");

  async function handleChange(newRole: Role) {
    const result = await changeRoleAction(userId, newRole);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Role updated successfully");
      router.refresh();
    }
  }

  return (
    <Select
      defaultValue={currentRole}
      onValueChange={(value) => handleChange(value as Role)}
      disabled={isDisabled}
    >
      <SelectTrigger className="w-44 text-base">
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
  );
}
