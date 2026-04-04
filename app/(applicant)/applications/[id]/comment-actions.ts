'use server'

import { auth } from '@/lib/auth'
import { commentsService } from '@/services/comments.service'
import type { Role } from '@/lib/validations/roles'

export async function addCommentAction(
  permitId: string,
  body: string
) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorised')

  try {
    const comment = await commentsService.addComment(
      permitId,
      session.user.id,
      session.user.role as Role,
      body
    )
    return { success: true, comment }
  } catch (err) {
    if (err instanceof Error) return { error: err.message }
    return { error: 'Failed to post comment' }
  }
}

export async function editCommentAction(
  commentId: string,
  body: string
) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorised')

  try {
    const comment = await commentsService.editComment(
      commentId,
      session.user.id,
      session.user.role as Role,
      body
    )
    return { success: true, comment }
  } catch (err) {
    if (err instanceof Error) return { error: err.message }
    return { error: 'Failed to edit comment' }
  }
}

export async function deleteCommentAction(commentId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorised')

  try {
    await commentsService.deleteComment(
      commentId,
      session.user.id,
      session.user.role as Role
    )
    return { success: true }
  } catch (err) {
    if (err instanceof Error) return { error: err.message }
    return { error: 'Failed to delete comment' }
  }
}