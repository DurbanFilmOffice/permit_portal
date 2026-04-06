import { auth } from '@/lib/auth'
import { portalNotificationsRepository } from '@/repositories/portal-notifications.repository'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ notifications: [] })
  }

  const notifications = await portalNotificationsRepository.findByUser(
    session.user.id
  )

  return Response.json({ notifications })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json() as { markAll?: boolean; id?: string }

  if (body.markAll) {
    await portalNotificationsRepository.markAllRead(session.user.id)
  } else if (body.id) {
    await portalNotificationsRepository.markRead(body.id, session.user.id)
  }

  return Response.json({ success: true })
}