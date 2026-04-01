import { db } from '@/lib/db'
import { users } from '@/db/schema/users'
import { eq } from 'drizzle-orm'
import type { User, NewUser } from '@/db/schema/users'

export const usersRepository = {
  findById: (id: string) =>
    db.select().from(users)
      .where(eq(users.id, id))
      .limit(1)
      .then(r => r[0] ?? null),

  findByEmail: (email: string) =>
    db.select().from(users)
      .where(eq(users.email, email))
      .limit(1)
      .then(r => r[0] ?? null),

  findByVerificationToken: (token: string) =>
    db.select().from(users)
      .where(eq(users.verificationToken, token))
      .limit(1)
      .then(r => r[0] ?? null),

  findByResetToken: (token: string) =>
    db.select().from(users)
      .where(eq(users.resetToken, token))
      .limit(1)
      .then(r => r[0] ?? null),

  create: (data: NewUser) =>
    db.insert(users).values(data).returning().then(r => r[0]),

  update: (id: string, data: Partial<NewUser>) =>
    db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
      .then(r => r[0]),
}