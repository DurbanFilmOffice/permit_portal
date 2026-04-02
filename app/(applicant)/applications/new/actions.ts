'use server'

import { auth } from '@/lib/auth'
import { permitsService } from '@/services/permits.service'
import { uploadFile } from '@/lib/storage'
import { permitFormSchema } from '@/lib/validations/permit-form.schema'

export async function createDraftAction(): Promise<{ permitId: string }> {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorised')

  // Create minimal draft — just enough to get a permitId
  const draft = await permitsService.createDraft(session.user.id, {
    projectName: 'Untitled',
    formData: {} as never,
  })

  return { permitId: draft.id }
}

export async function submitPermitAction(
  permitId: string,
  formData: unknown,
  fileData: { name: string; type: string; size: number; base64: string }[]
): Promise<{ success: true } | { error: string | ReturnType<ReturnType<typeof permitFormSchema.safeParse>['error']['flatten']> }> {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorised')

  const parsed = permitFormSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }

  // Upload files to Supabase Storage
  const uploadedFiles = await Promise.all(
    fileData.map(async f => {
      const buffer = Buffer.from(f.base64, 'base64')
      const file = new File([buffer], f.name, { type: f.type })
      const path = `permits/${permitId}/${Date.now()}-${f.name}`
      const url = await uploadFile(
        process.env.STORAGE_BUCKET ?? 'permit-documents',
        path,
        file
      )
      return { name: f.name, url, type: f.type, size: f.size }
    })
  )

  try {
    await permitsService.submitPermit(
      permitId,
      session.user.id,
      parsed.data,
      uploadedFiles
    )
    return { success: true }
  } catch (err) {
    if (err instanceof Error) return { error: err.message }
    return { error: 'Something went wrong. Please try again.' }
  }
}