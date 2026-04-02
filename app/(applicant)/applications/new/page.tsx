import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PermitForm from "@/components/permits/permit-form";

export default async function NewApplicationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          New Permit Application
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete all sections and submit your application
        </p>
      </div>
      <PermitForm />
    </div>
  );
}
