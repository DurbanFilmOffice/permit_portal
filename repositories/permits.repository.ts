import { db } from '@/lib/db'
import { permits } from '@/db/schema/permits'
import { eq, desc, and, ilike } from 'drizzle-orm'
import type { NewPermit } from '@/db/schema/permits'

export const permitsRepository = {

  findByUser: (userId: string) =>
    db.select().from(permits)
      .where(eq(permits.userId, userId))
      .orderBy(desc(permits.createdAt)),

  findById: (id: string) =>
    db.select().from(permits)
      .where(eq(permits.id, id))
      .limit(1)
      .then(r => r[0] ?? null),

  findAll: (filters?: { status?: string; search?: string }) => {
    const conditions = []
    if (filters?.status) {
      conditions.push(eq(permits.status, filters.status as typeof permits.status.dataType))
    }
    if (filters?.search) {
      conditions.push(ilike(permits.projectName, `%${filters.search}%`))
    }
    return db.select().from(permits)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(permits.createdAt))
  },

  create: (data: NewPermit) =>
    db.insert(permits).values(data).returning().then(r => r[0]),

  update: (id: string, data: Partial<NewPermit>) =>
    db.update(permits)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(permits.id, id))
      .returning()
      .then(r => r[0]),
}