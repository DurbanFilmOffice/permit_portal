import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ROLE_CONFIG } from "@/lib/validations/roles";

interface AccountInfoProps {
  user: {
    email: string;
    role: string;
    emailVerified: boolean;
    createdAt: Date;
  };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AccountInfo({ user }: AccountInfoProps) {
  const roleConfig = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Account Information
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Your account details
        </CardDescription>
      </CardHeader>

      <CardContent>
        <dl className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-1">
            <dt className="text-sm text-muted-foreground">Role</dt>
            <dd>
              {roleConfig ? (
                <Badge className={cn("text-sm", roleConfig.badgeClass)}>
                  {roleConfig.label}
                </Badge>
              ) : (
                <Badge className="text-sm">{user.role}</Badge>
              )}
            </dd>
          </div>

          <div className="space-y-1">
            <dt className="text-sm text-muted-foreground">Email Status</dt>
            <dd>
              {user.emailVerified ? (
                <Badge className="text-sm bg-green-100 text-green-800 hover:bg-green-100">
                  Verified
                </Badge>
              ) : (
                <Badge className="text-sm bg-amber-100 text-amber-800 hover:bg-amber-100">
                  Not verified
                </Badge>
              )}
            </dd>
          </div>

          <div className="space-y-1">
            <dt className="text-sm text-muted-foreground">Member Since</dt>
            <dd className="text-base font-medium">
              {formatDate(user.createdAt)}
            </dd>
          </div>

          <div className="space-y-1">
            <dt className="text-sm text-muted-foreground">Account Status</dt>
            <dd>
              <Badge className="text-sm bg-green-100 text-green-800 hover:bg-green-100">
                Active
              </Badge>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
