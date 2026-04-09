import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq, inArray, asc } from "drizzle-orm";
import type { User, NewUser } from "@/db/schema/users";

const userListFields = {
  id: users.id,
  email: users.email,
  fullName: users.fullName,
  role: users.role,
  emailVerified: users.emailVerified,
  isActive: users.isActive,
  createdAt: users.createdAt,
};

const internalRoles = [
  "external_user",
  "permit_officer",
  "permit_admin",
  "admin",
  "super_admin",
] as const;

export const usersRepository = {
  findById: (id: string) =>
    db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1)
      .then((r) => r[0] ?? null),

  findByEmail: (email: string) =>
    db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then((r) => r[0] ?? null),

  findByVerificationToken: (token: string) =>
    db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token))
      .limit(1)
      .then((r) => r[0] ?? null),

  findByResetToken: (token: string) =>
    db
      .select()
      .from(users)
      .where(eq(users.resetToken, token))
      .limit(1)
      .then((r) => r[0] ?? null),

  create: (data: NewUser) =>
    db
      .insert(users)
      .values(data)
      .returning()
      .then((r) => r[0]),

  update: (id: string, data: Partial<NewUser>) =>
    db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
      .then((r) => r[0]),

  // Find all internal users for the assignment dropdown
  findInternalUsers: () =>
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(inArray(users.role, [...internalRoles]))
      .orderBy(asc(users.fullName)),

  findAll: () =>
    db.select(userListFields).from(users).orderBy(asc(users.fullName)),

  updateRole: (id: string, role: string) =>
    db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
      .then((r) => r[0]),

  setActive: (id: string, isActive: boolean) =>
    db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
      .then((r) => r[0]),

  findApplicants: () =>
    db
      .select(userListFields)
      .from(users)
      .where(eq(users.role, "applicant"))
      .orderBy(asc(users.fullName)),

  findInternalStaff: () =>
    db
      .select(userListFields)
      .from(users)
      .where(inArray(users.role, [...internalRoles]))
      .orderBy(asc(users.fullName)),
};
