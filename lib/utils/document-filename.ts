// ─── Document type → human readable filename map ─────────────────────────────

const DOCUMENT_TYPE_FILENAMES: Record<string, string> = {
  location_illustration: "location-illustration",
  traffic_illustration: "traffic-parking-illustration",
  sfx_sketch: "sfx-site-plan",
  pyrotechnician_qualifications: "pyrotechnician-qualifications",
  roc_certificate: "roc-remote-operating-certificate",
  rpl_licence: "rpl-remote-pilot-licence",
  asl_licence: "asl-air-services-licence",
  aerial_public_liability: "aerial-public-liability-insurance",
  aerial_disaster_form: "aerial-disaster-management-form",
  public_liability_insurance: "public-liability-insurance",
  city_indemnity: "city-indemnity",
  proof_of_payment: "proof-of-payment",
  filming_schedule: "filming-schedule",
  script_synopsis: "script-synopsis",
  approved_risk_letter: "approved-risk-categorisation-letter",
  approved_disaster_management: "approved-disaster-management-form",
  company_letterhead: "company-letterhead",
  applicant_id: "applicant-id-copy",
  additional_1: "additional-document-1",
  additional_2: "additional-document-2",
  additional_3: "additional-document-3",
};

// Sanitise a string for use as a filename — no spaces or special characters
function sanitise(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Build a descriptive filename for a permit document upload.
 *
 * Uses the document_type to generate a human-readable base name,
 * then appends the original file extension.
 *
 * Examples:
 *   buildDocumentFilename('public_liability_insurance', 'My Document.pdf')
 *   → 'public-liability-insurance.pdf'
 *
 *   buildDocumentFilename('additional_1', 'site photo.jpg')
 *   → 'additional-document-1.jpg'
 *
 *   buildDocumentFilename('unknown_type', 'My File.pdf')
 *   → 'my-file.pdf'  (falls back to sanitised original name)
 */
export function buildDocumentFilename(
  documentType: string,
  originalName: string,
): string {
  const lastDot = originalName.lastIndexOf(".");
  const ext = lastDot !== -1 ? originalName.slice(lastDot) : "";
  const base =
    DOCUMENT_TYPE_FILENAMES[documentType] ??
    sanitise(lastDot !== -1 ? originalName.slice(0, lastDot) : originalName);
  return `${base}${ext}`;
}
