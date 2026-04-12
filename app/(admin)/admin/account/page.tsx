import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { usersRepository } from "@/repositories/users.repository";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/account/profile-form";
import ChangePasswordForm from "@/components/account/change-password-form";
import AccountInfo from "@/components/account/account-info";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await usersRepository.findById(session.user.id);
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Account Settings
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          Manage your profile and account preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList variant="line">
          <TabsTrigger value="profile" className="text-base">
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="text-base">
            Security
          </TabsTrigger>
          <TabsTrigger value="info" className="text-base">
            Account Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileForm fullName={user.fullName} email={user.email} />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <ChangePasswordForm />
        </TabsContent>
        <TabsContent value="info" className="mt-6">
          <AccountInfo
            user={{
              email: user.email,
              role: user.role,
              emailVerified: user.emailVerified,
              createdAt: user.createdAt,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
