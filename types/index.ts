import type { Role } from "@/lib/validations/roles";

export type NavItem = {
  label: string;
  href: string;
  icon: string; // key into ICON_MAP in sidebar.tsx — safe to pass across server/client boundary
  roles: Role[];
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};
