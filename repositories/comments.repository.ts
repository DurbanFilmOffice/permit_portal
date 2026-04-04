import { db } from "@/lib/db";
import { permitComments } from "@/db/schema/permit-comments";
import { users } from "@/db/schema/users";
import { eq, asc } from "drizzle-orm";
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
      .where(eq(permitComments.permitId, permitId))
      .orderBy(asc(permitComments.createdAt)),

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
    db.delete(permitComments).where(eq(permitComments.id, id)),

  findById: (id: string) =>
    db
      .select()
      .from(permitComments)
      .where(eq(permitComments.id, id))
      .limit(1)
      .then((r) => r[0] ?? null),
};
