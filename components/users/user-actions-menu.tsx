"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type Role = string;

interface UserActionsMenuProps {
  userId: string;
  fullName: string;
  isActive: boolean;
  currentUserId: string;
  requestingRole: Role;
}

export default function UserActionsMenu({
  userId,
  fullName,
  isActive,
  currentUserId,
  requestingRole,
}: UserActionsMenuProps) {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link
        href={`/admin/applications?search=${fullName}`}
        className="text-base"
      >
        View applications
      </Link>
    </Button>
  );
}
