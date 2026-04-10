import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { usersService } from "@/services/users.service";
import type { Role } from "@/lib/validations/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import UserEditForm from "@/components/users/user-edit-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserEditPage({ params }: Props) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!["admin", "super_admin"].includes(session.user.role)) {
    redirect("/admin/dashboard");
  }

  const user = await usersService.getUserById(id).catch(() => null);
  if (!user) notFound();

  return (
    <div className="space-y-8 max-w-2xl border rounded-md bg-card p-6">
      {/* Back link */}
      <div>
        {/* <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-base">Back to users</span>
          </Link>
        </Button> */}

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-base font-medium flex-shrink-0">
            {user.fullName
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {user.fullName}
            </h1>
            <p className="text-base text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex gap-2 ml-auto">
            <Badge
              className={
                user.isActive
                  ? "bg-green-500/15 text-green-600 dark:text-green-400"
                  : "bg-red-500/15 text-red-600 dark:text-red-400"
              }
            >
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
            {!user.emailVerified && (
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400">
                Unverified
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <UserEditForm
        user={{
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role as Role,
          isActive: user.isActive,
        }}
        currentUserId={session.user.id}
        requestingRole={session.user.role as Role}
      />
    </div>
  );
}
