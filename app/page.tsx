import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isInternalRole } from "@/lib/validations/roles";

export default async function RootPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (isInternalRole(session.user.role)) redirect("/admin/dashboard");
  redirect("/applications");
}
