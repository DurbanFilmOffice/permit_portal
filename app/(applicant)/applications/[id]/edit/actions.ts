'use server'

import { auth } from '@/lib/auth'
import { permitsService } from '@/services/permits.service'
import { uploadFile } from '@/lib/storage'
import { permitFormSchema } from '@/lib/validations/permit-form.schema'
import { permitDocumentsRepository } from '@/repositories/permit-documents.repository'
import { buildDocumentFilename } from '@/lib/utils/document-filename'
import { redirect } from 'next/navigation'

async function uploadFileData(
  permitId: string,
  fileData: Array<{
    documentType: string
    name: string
    type: string
    size: number
    base64: string
  }>,
) {
  await Promise.all(
    fileData.map(async f => {
      const filename = buildDocumentFilename(f.documentType, f.name)
      const buffer   = Buffer.from(f.base64, 'base64')
      const file     = new File([buffer], filename, { type: f.type })
      const path     = `permits/${permitId}/${f.documentType}/${filename}`
      const url      = await uploadFile(
        process.env.STORAGE_BUCKET ?? 'permit-documents',
        path,
        file,
      )
      return permitDocumentsRepository.upsertByPermitAndType({
        permitId,
        fileName:      filename,
        fileUrl:       url,
        fileType:      f.type,
        fileSizeBytes: f.size,
        documentType:  f.documentType,
      })
    }),
  )
}

export async function updatePermitAction(
  permitId: string,
  formData: unknown,
  fileData: Array<{
    documentType: string
    name: string
    type: string
    size: number
    base64: string
  }> = [],
) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorised')

  const parsed = permitFormSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }

  try {
    await permitsService.updatePermit(permitId, session.user.id, parsed.data)
    if (fileData.length > 0) {
      await uploadFileData(permitId, fileData)
    }
  } catch (err) {
    if (err instanceof Error) return { success: false, error: err.message }
    return { success: false, error: 'Something went wrong. Please try again.' }
  }

  redirect(`/applications/${permitId}`)
}

export async function resubmitPermitAction(
  permitId: string,
  formData: unknown,
  fileData: Array<{
    documentType: string
    name: string
    type: string
    size: number
    base64: string
  }> = [],
) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorised')

  const parsed = permitFormSchema.safeParse(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() }
  }

  try {
    await permitsService.resubmitPermit(permitId, session.user.id, parsed.data)
    if (fileData.length > 0) {
      await uploadFileData(permitId, fileData)
    }
  } catch (err) {
    if (err instanceof Error) return { success: false, error: err.message }
    return { success: false, error: 'Something went wrong. Please try again.' }
  }

  redirect(`/applications/${permitId}`)
}