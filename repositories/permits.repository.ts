import { db } from "@/lib/db";
import { permits } from "@/db/schema/permits";
import { users } from "@/db/schema/users";
import { permitAssignments } from "@/db/schema/permit-assignments";
import {
  eq,
  desc,
  and,
  ilike,
  inArray,
  count,
  gte,
  lte,
  or,
  sql,
} from "drizzle-orm";
import type { NewPermit } from "@/db/schema/permits";

export const permitsRepository = {
  findByUser: (userId: string) =>
    db
      .select()
      .from(permits)
      .where(eq(permits.userId, userId))
      .orderBy(desc(permits.createdAt)),

  findById: (id: string) =>
    db
      .select()
      .from(permits)
      .where(eq(permits.id, id))
      .limit(1)
      .then((r) => r[0] ?? null),

  findAll: (filters?: { status?: string; search?: string }) => {
    const conditions = [];
    if (filters?.status) {
      conditions.push(
        eq(permits.status, filters.status as typeof permits.status._.data),
      );
    }
    if (filters?.search) {
      conditions.push(ilike(permits.projectName, `%${filters.search}%`));
    }
    return db
      .select()
      .from(permits)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(permits.createdAt));
  },

  create: (data: NewPermit) =>
    db
      .insert(permits)
      .values(data)
      .returning()
      .then((r) => r[0]),

  update: (id: string, data: Partial<NewPermit>) =>
    db
      .update(permits)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(permits.id, id))
      .returning()
      .then((r) => r[0]),

  // Save as draft (status = 'draft')
  createDraft: (data: NewPermit) =>
    db
      .insert(permits)
      .values({ ...data, status: "draft" })
      .returning()
      .then((r) => r[0]),

  // Update draft fields — only updates rows still in 'draft' status
  updateDraft: (id: string, data: Partial<NewPermit>) =>
    db
      .update(permits)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(permits.id, id), eq(permits.status, "draft")))
      .returning()
      .then((r) => r[0]),

  // Submit (status = 'submitted')
  submit: (id: string) =>
    db
      .update(permits)
      .set({
        status: "submitted",
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(permits.id, id))
      .returning()
      .then((r) => r[0]),

  // All applications (admin: all permits)
  findAllWithFilters: (filters?: { status?: string; search?: string }) => {
    const conditions = [];
    if (filters?.status) {
      conditions.push(
        eq(permits.status, filters.status as typeof permits.status._.data),
      );
    }
    if (filters?.search) {
      conditions.push(ilike(permits.projectName, `%${filters.search}%`));
    }
    return db
      .select()
      .from(permits)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(permits.createdAt));
  },

  // My Applications (internal: only assigned permits)
  findByIds: (ids: string[]) => {
    if (ids.length === 0) return Promise.resolve([]);
    return db
      .select()
      .from(permits)
      .where(inArray(permits.id, ids))
      .orderBy(desc(permits.createdAt));
  },

  // Paginated + filtered query for admin applications table
  findWithFilters: async (
    filters: {
      search?: string;
      status?: string;
      tab?: string;
      assignedUserId?: string;
      from?: string;
      to?: string;
    },
    pagination: { limit: number; offset: number },
  ) => {
    const conditions = buildPermitConditions(filters);
    const isMineTab = filters.tab === "mine" && filters.assignedUserId;

    const baseQuery = db
      .select({
        id: permits.id,
        userId: permits.userId,
        projectName: permits.projectName,
        siteAddress: permits.siteAddress,
        status: permits.status,
        submittedAt: permits.submittedAt,
        createdAt: permits.createdAt,
        formData: permits.formData,
        applicant: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(permits)
      .leftJoin(users, eq(permits.userId, users.id));

    if (isMineTab) {
      return baseQuery
        .innerJoin(
          permitAssignments,
          eq(permitAssignments.permitId, permits.id),
        )
        .where(conditions)
        .orderBy(desc(permits.createdAt))
        .limit(pagination.limit)
        .offset(pagination.offset);
    }

    return baseQuery
      .where(conditions)
      .orderBy(desc(permits.createdAt))
      .limit(pagination.limit)
      .offset(pagination.offset);
  },

  // Count for pagination meta
  countWithFilters: async (filters: {
    search?: string;
    status?: string;
    tab?: string;
    assignedUserId?: string;
    from?: string;
    to?: string;
  }) => {
    const conditions = buildPermitConditions(filters);
    const isMineTab = filters.tab === "mine" && filters.assignedUserId;

    const baseQuery = db
      .select({ count: count() })
      .from(permits)
      .leftJoin(users, eq(permits.userId, users.id));

    if (isMineTab) {
      return baseQuery
        .innerJoin(
          permitAssignments,
          eq(permitAssignments.permitId, permits.id),
        )
        .where(conditions)
        .then((r) => Number(r[0]?.count ?? 0));
    }

    return baseQuery.where(conditions).then((r) => Number(r[0]?.count ?? 0));
  },
};

// Private helper — not exported
function buildPermitConditions(filters: {
  search?: string;
  status?: string;
  tab?: string;
  assignedUserId?: string;
  from?: string;
  to?: string;
}) {
  const conditions = [];

  if (filters.status) {
    conditions.push(
      eq(permits.status, filters.status as typeof permits.status._.data),
    );
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    conditions.push(
      or(
        // Cast uuid to text before ilike — Postgres won't apply ~~ to uuid directly
        sql`${permits.id}::text ilike ${search + "%"}`,
        ilike(permits.projectName, `%${filters.search}%`),
        ilike(users.fullName, `%${filters.search}%`),
        ilike(users.email, `%${filters.search}%`),
      ),
    );
  }

  if (filters.from) {
    conditions.push(gte(permits.createdAt, new Date(filters.from)));
  }

  if (filters.to) {
    conditions.push(lte(permits.createdAt, new Date(filters.to)));
  }

  if (filters.tab === "mine" && filters.assignedUserId) {
    conditions.push(eq(permitAssignments.userId, filters.assignedUserId));
  }

  return conditions.length ? and(...conditions) : undefined;
}
