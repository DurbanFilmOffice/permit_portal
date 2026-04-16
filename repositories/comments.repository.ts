import { db } from "@/lib/db";
import { permitComments } from "@/db/schema/permit-comments";
import { users } from "@/db/schema/users";
import { eq, and, asc, isNull, isNotNull } from "drizzle-orm";
import type { NewPermitComment } from "@/db/schema/permit-comments";

export const commentsRepository = {
  findByPermit: (permitId: string) =>
    db
      .select({
        id: permitComments.id,
        permitId: permitComments.permitId,
        body: permitComments.body,
        createdAt: permitComments.createdAt,
        updatedAt: permitComments.updatedAt,
        author: {
          id: users.id,
          fullName: users.fullName,
          role: users.role,
        },
      })
      .from(permitComments)
      .innerJoin(users, eq(permitComments.authorId, users.id))
      .where(
        and(
          eq(permitComments.permitId, permitId),
          isNull(permitComments.deletedAt),
        ),
      )
      .orderBy(asc(permitComments.createdAt)),

  findByPermitWithDeleted: (permitId: string) =>
    db
      .select({
        id: permitComments.id,
        permitId: permitComments.permitId,
        body: permitComments.body,
        createdAt: permitComments.createdAt,
        updatedAt: permitComments.updatedAt,
        deletedAt: permitComments.deletedAt,
        author: {
          id: users.id,
          fullName: users.fullName,
          role: users.role,
        },
      })
      .from(permitComments)
      .innerJoin(users, eq(permitComments.authorId, users.id))
      .where(
        and(
          eq(permitComments.permitId, permitId),
          isNotNull(permitComments.deletedAt),
        ),
      )
      .orderBy(asc(permitComments.deletedAt)),

  create: (data: NewPermitComment) =>
    db
      .insert(permitComments)
      .values(data)
      .returning()
      .then((r) => r[0]),

  update: (id: string, body: string) =>
    db
      .update(permitComments)
      .set({ body, updatedAt: new Date() })
      .where(eq(permitComments.id, id))
      .returning()
      .then((r) => r[0]),

  delete: (id: string) =>
    db
      .update(permitComments)
      .set({ deletedAt: new Date() })
      .where(eq(permitComments.id, id)),

  restore: (id: string) =>
    db
      .update(permitComments)
      .set({ deletedAt: null })
      .where(eq(permitComments.id, id))
      .returning()
      .then((r) => r[0]),

  findById: (id: string) =>
    db
      .select()
      .from(permitComments)
      .where(eq(permitComments.id, id))
      .limit(1)
      .then((r) => r[0] ?? null),
};
