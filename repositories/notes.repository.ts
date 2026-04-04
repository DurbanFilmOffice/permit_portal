import { db } from "@/lib/db";
import { applicationNotes } from "@/db/schema/application-notes";
import { users } from "@/db/schema/users";
import { eq, asc } from "drizzle-orm";
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
      .where(eq(applicationNotes.permitId, permitId))
      .orderBy(asc(applicationNotes.createdAt)),

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
    db.delete(applicationNotes).where(eq(applicationNotes.id, id)),

  findById: (id: string) =>
    db
      .select()
      .from(applicationNotes)
      .where(eq(applicationNotes.id, id))
      .limit(1)
      .then((r) => r[0] ?? null),
};
