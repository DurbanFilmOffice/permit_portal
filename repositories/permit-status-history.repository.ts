import { db } from '@/lib/db'
import { permitStatusHistory } from '@/db/schema/permit-status-history'
import { users } from '@/db/schema/users'
import { eq, asc } from 'drizzle-orm'
import type { NewPermitStatusHistory } from '@/db/schema/permit-status-history'

export const permitStatusHistoryRepository = {

  findByPermit: (permitId: string) =>
    db.select({
      id:        permitStatusHistory.id,
      permitId:  permitStatusHistory.permitId,
      oldStatus: permitStatusHistory.oldStatus,
      newStatus: permitStatusHistory.newStatus,
      comment:   permitStatusHistory.comment,
      changedAt: permitStatusHistory.changedAt,
      changedBy: {
        id:       users.id,
        fullName: users.fullName,
        role:     users.role,
      },
    })
    .from(permitStatusHistory)
    .leftJoin(users, eq(permitStatusHistory.changedBy, users.id))
    .where(eq(permitStatusHistory.permitId, permitId))
    .orderBy(asc(permitStatusHistory.changedAt)),

  create: (data: NewPermitStatusHistory) =>
    db.insert(permitStatusHistory)
      .values(data)
      .returning()
      .then(r => r[0]),
}