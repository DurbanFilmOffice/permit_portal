"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UserActionsMenuProps {
  userId: string;
}

export default function UserActionsMenu({ userId }: UserActionsMenuProps) {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={`/admin/users/${userId}`} className="text-base">
        Edit user
      </Link>
    </Button>
  );
}
