import { db } from '@/lib/db'
import { permitDocuments } from '@/db/schema/permit-documents'
import { eq } from 'drizzle-orm'
import type { NewPermitDocument } from '@/db/schema/permit-documents'

export const permitDocumentsRepository = {
  findByPermit: (permitId: string) =>
    db
      .select()
      .from(permitDocuments)
      .where(eq(permitDocuments.permitId, permitId)),

  create: (data: NewPermitDocument) =>
    db
      .insert(permitDocuments)
      .values(data)
      .returning()
      .then(r => r[0]),

  deleteById: (id: string) =>
    db
      .delete(permitDocuments)
      .where(eq(permitDocuments.id, id)),
}