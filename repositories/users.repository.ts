import { db } from "@/lib/db";
import { users } from "@/db/schema/users";
import { eq, inArray, asc, count, and, ilike, or } from "drizzle-orm";
import type { NewUser } from "@/db/schema/users";

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

  // Paginated + filtered query for admin users table
  findWithFilters: async (
    filters: {
      search?: string;
      role?: string;
      status?: string;
    },
    pagination: { limit: number; offset: number },
  ) => {
    const conditions = buildUserConditions(filters);
    return db
      .select(userListFields)
      .from(users)
      .where(conditions)
      .orderBy(asc(users.fullName))
      .limit(pagination.limit)
      .offset(pagination.offset);
  },

  // Count for pagination meta
  countWithFilters: async (filters: {
    search?: string;
    role?: string;
    status?: string;
  }) => {
    const conditions = buildUserConditions(filters);
    return db
      .select({ count: count() })
      .from(users)
      .where(conditions)
      .then((r) => Number(r[0]?.count ?? 0));
  },
};

// Private helper — not exported
function buildUserConditions(filters: {
  search?: string;
  role?: string;
  status?: string;
}) {
  const conditions = [];

  if (filters.search) {
    conditions.push(
      or(
        ilike(users.fullName, `%${filters.search}%`),
        ilike(users.email, `%${filters.search}%`),
      ),
    );
  }

  if (filters.role) {
    conditions.push(eq(users.role, filters.role));
  }

  if (filters.status === "active") {
    conditions.push(eq(users.isActive, true));
  } else if (filters.status === "inactive") {
    conditions.push(eq(users.isActive, false));
  }

  return conditions.length ? and(...conditions) : undefined;
}