import { db } from "@/lib/db";
import { permitDocuments } from "@/db/schema/permit-documents";
import { eq, and } from "drizzle-orm";
import type { NewPermitDocument } from "@/db/schema/permit-documents";

export const permitDocumentsRepository = {
  findByPermit: (permitId: string) =>
    db
      .select()
      .from(permitDocuments)
      .where(eq(permitDocuments.permitId, permitId)),

  findByPermitAndType: (permitId: string, documentType: string) =>
    db
      .select()
      .from(permitDocuments)
      .where(
        and(
          eq(permitDocuments.permitId, permitId),
          eq(permitDocuments.documentType, documentType),
        ),
      ),

  create: (data: NewPermitDocument) =>
    db
      .insert(permitDocuments)
      .values(data)
      .returning()
      .then((r) => r[0]),

  // Delete existing row for this permit+type then insert new one.
  // Prevents duplicate document rows when re-uploading on edit.
  upsertByPermitAndType: async (data: NewPermitDocument) => {
    if (data.documentType) {
      await db
        .delete(permitDocuments)
        .where(
          and(
            eq(permitDocuments.permitId, data.permitId),
            eq(permitDocuments.documentType, data.documentType),
          ),
        );
    }
    return db
      .insert(permitDocuments)
      .values(data)
      .returning()
      .then((r) => r[0]);
  },

  deleteById: (id: string) =>
    db.delete(permitDocuments).where(eq(permitDocuments.id, id)),
};
