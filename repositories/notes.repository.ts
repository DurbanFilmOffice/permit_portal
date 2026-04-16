import { db } from "@/lib/db";
import { applicationNotes } from "@/db/schema/application-notes";
import { users } from "@/db/schema/users";
import { eq, and, asc, isNull, isNotNull } from "drizzle-orm";
import type { NewApplicationNote } from "@/db/schema/application-notes";

export const notesRepository = {
  findByPermit: (permitId: string) =>
    db
      .select({
        id: applicationNotes.id,
        permitId: applicationNotes.permitId,
        body: applicationNotes.body,
        createdAt: applicationNotes.createdAt,
        updatedAt: applicationNotes.updatedAt,
        author: {
          id: users.id,
          fullName: users.fullName,
          role: users.role,
        },
      })
      .from(applicationNotes)
      .innerJoin(users, eq(applicationNotes.authorId, users.id))
      .where(
        and(
          eq(applicationNotes.permitId, permitId),
          isNull(applicationNotes.deletedAt),
        ),
      )
      .orderBy(asc(applicationNotes.createdAt)),

  findByPermitWithDeleted: (permitId: string) =>
    db
      .select({
        id: applicationNotes.id,
        permitId: applicationNotes.permitId,
        body: applicationNotes.body,
        createdAt: applicationNotes.createdAt,
        updatedAt: applicationNotes.updatedAt,
        deletedAt: applicationNotes.deletedAt,
        author: {
          id: users.id,
          fullName: users.fullName,
          role: users.role,
        },
      })
      .from(applicationNotes)
      .innerJoin(users, eq(applicationNotes.authorId, users.id))
      .where(
        and(
          eq(applicationNotes.permitId, permitId),
          isNotNull(applicationNotes.deletedAt),
        ),
      )
      .orderBy(asc(applicationNotes.deletedAt)),

  create: (data: NewApplicationNote) =>
    db
      .insert(applicationNotes)
      .values(data)
      .returning()
      .then((r) => r[0]),

  update: (id: string, body: string) =>
    db
      .update(applicationNotes)
      .set({ body, updatedAt: new Date() })
      .where(eq(applicationNotes.id, id))
      .returning()
      .then((r) => r[0]),

  delete: (id: string) =>
    db
      .update(applicationNotes)
      .set({ deletedAt: new Date() })
      .where(eq(applicationNotes.id, id)),

  restore: (id: string) =>
    db
      .update(applicationNotes)
      .set({ deletedAt: null })
      .where(eq(applicationNotes.id, id))
      .returning()
      .then((r) => r[0]),

  findById: (id: string) =>
    db
      .select()
      .from(applicationNotes)
      .where(eq(applicationNotes.id, id))
      .limit(1)
      .then((r) => r[0] ?? null),
};
