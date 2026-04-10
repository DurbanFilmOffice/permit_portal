import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CreateInternalUserForm from "@/components/users/create-internal-user-form";
import type { Role } from "@/lib/validations/roles";

export default async function NewInternalUserPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!["admin", "super_admin"].includes(session.user.role)) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Back link */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href="/admin/users/internal">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-base">Back to Administrative users </span>
          </Link>
        </Button>

        <h1 className="text-2xl font-semibold tracking-tight">
          Create internal user
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          Add a new staff account with access to the admin portal.
        </p>
      </div>

      <CreateInternalUserForm requestingRole={session.user.role as Role} />
    </div>
  );
}
