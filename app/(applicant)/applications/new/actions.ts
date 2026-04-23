"use server";

import { auth } from "@/lib/auth";
import { permitsService } from "@/services/permits.service";
import { uploadFile } from "@/lib/storage";
import { permitFormSchema } from "@/lib/validations/permit-form.schema";
import { permitDocumentsRepository } from "@/repositories/permit-documents.repository";
import { permitsRepository } from "@/repositories/permits.repository";
import { notificationsService } from "@/services/notifications.service";
import { actionSuccess, actionError } from "@/lib/utils/action-response";
import type { ActionResponse } from "@/lib/utils/action-response";
import { buildDocumentFilename } from "@/lib/utils/document-filename";

export async function createDraftAction(): Promise<{ permitId: string }> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorised");

  const draft = await permitsService.createDraft(session.user.id, {
    projectName: "Untitled",
    formData: {} as never,
  });

  return { permitId: draft.id };
}

export async function submitPermitAction(
  permitId: string,
  formData: unknown,
  fileData: Array<{
    documentType: string;
    name: string;
    type: string;
    size: number;
    base64: string;
  }>,
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user) return actionError("Unauthorised");

  const parsed = permitFormSchema.safeParse(formData);
  if (!parsed.success) {
    return actionError("Validation failed. Please check your answers.");
  }

  try {
    await permitsService.updatePermit(permitId, session.user.id, parsed.data);

    await Promise.all(
      fileData.map(async (f) => {
        const filename = buildDocumentFilename(f.documentType, f.name);
        const buffer = Buffer.from(f.base64, "base64");
        const file = new File([buffer], filename, { type: f.type });
        const path = `permits/${permitId}/${f.documentType}/${filename}`;
        const url = await uploadFile(
          process.env.STORAGE_BUCKET ?? "permit-documents",
          path,
          file,
        );
        return permitDocumentsRepository.upsertByPermitAndType({
          permitId,
          fileName: filename,
          fileUrl: url,
          fileType: f.type,
          fileSizeBytes: f.size,
          documentType: f.documentType,
        });
      }),
    );

    await permitsRepository.submit(permitId);

    const permit = await permitsRepository.findById(permitId);
    if (permit) {
      notificationsService
        .onPermitSubmitted(permit)
        .catch((err) => console.error("Submit notification failed:", err));
    }

    return actionSuccess();
  } catch (err) {
    return actionError(err);
  }
}
