'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { addCommentAction } from '@/app/(applicant)/applications/[id]/comment-actions'
import type { Role } from '@/lib/validations/roles'

type Props = {
  permitId: string
  currentUserRole: Role
  permitStatus: string
  isExternalUser: boolean
}

const APPLICANT_STATUSES = ['submitted', 'under_review', 'returned']
const MAX_LENGTH = 2000
const MIN_LENGTH = 3

export function CommentForm({
  permitId,
  currentUserRole,
  permitStatus,
  isExternalUser,
}: Props) {
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (isExternalUser) return null

  const isClosed =
    currentUserRole === 'applicant' &&
    !APPLICANT_STATUSES.includes(permitStatus)

  if (isClosed) {
    return (
      <div className="rounded-lg border border-dashed p-6">
        <p className="text-base text-muted-foreground">
          Comments are closed for this application.
        </p>
      </div>
    )
  }

  const isSubmittable = body.trim().length >= MIN_LENGTH

  function handleSubmit() {
    if (!isSubmittable) return
    setError(null)

    startTransition(async () => {
      const result = await addCommentAction(permitId, body)
      if (result.error) {
        setError(result.error)
        return
      }
      setBody('')
    })
  }

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-base">{error}</AlertDescription>
        </Alert>
      )}

      <Textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Write a comment..."
        maxLength={MAX_LENGTH}
        disabled={isPending}
        className="text-base min-h-[100px] resize-y"
      />

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {body.length} / {MAX_LENGTH}
        </span>

        <Button
          onClick={handleSubmit}
          disabled={!isSubmittable || isPending}
        >
          {isPending ? 'Posting…' : 'Post comment'}
        </Button>
      </div>
    </div>
  )
}