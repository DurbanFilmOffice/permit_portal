import { auth } from '@/lib/auth'
import { portalNotificationsRepository } from '@/repositories/portal-notifications.repository'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ count: 0 })
  }

  const count = await portalNotificationsRepository.countUnread(
    session.user.id
  )

  return Response.json({ count })
}