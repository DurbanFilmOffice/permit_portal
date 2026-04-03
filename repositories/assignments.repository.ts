import { db } from '@/lib/db'
import { permitAssignments } from '@/db/schema/permit-assignments'
import { users } from '@/db/schema/users'
import { eq, and } from 'drizzle-orm'
import type { NewPermitAssignment } from '@/db/schema/permit-assignments'

export const assignmentsRepository = {

  // All assignments for a permit with user details joined
  findByPermit: (permitId: string) =>
    db.select({
      id:         permitAssignments.id,
      permitId:   permitAssignments.permitId,
      assignedAt: permitAssignments.assignedAt,
      note:       permitAssignments.note,
      user: {
        id:       users.id,
        fullName: users.fullName,
        email:    users.email,
        role:     users.role,
      },
    })
    .from(permitAssignments)
    .innerJoin(users, eq(permitAssignments.userId, users.id))
    .where(eq(permitAssignments.permitId, permitId)),

  // All permits assigned to a specific user
  findPermitsByUser: (userId: string) =>
    db.select({ permitId: permitAssignments.permitId })
      .from(permitAssignments)
      .where(eq(permitAssignments.userId, userId)),

  // Check if a user is already assigned
  findOne: (permitId: string, userId: string) =>
    db.select().from(permitAssignments)
      .where(
        and(
          eq(permitAssignments.permitId, permitId),
          eq(permitAssignments.userId, userId)
        )
      )
      .limit(1)
      .then(r => r[0] ?? null),

  create: (data: NewPermitAssignment) =>
    db.insert(permitAssignments)
      .values(data)
      .returning()
      .then(r => r[0]),

  delete: (permitId: string, userId: string) =>
    db.delete(permitAssignments)
      .where(
        and(
          eq(permitAssignments.permitId, permitId),
          eq(permitAssignments.userId, userId)
        )
      ),
}