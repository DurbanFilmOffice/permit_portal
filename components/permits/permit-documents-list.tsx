import { FileText, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { PermitDocument } from "@/db/schema/permit-documents";

interface PermitDocumentsListProps {
  documents: PermitDocument[];
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`;
  return `${bytes} B`;
}

export default function PermitDocumentsList({
  documents,
}: PermitDocumentsListProps) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No documents uploaded.</p>
    );
  }

  return (
    <ul className="space-y-0">
      {documents.map((doc, index) => (
        <li key={doc.id}>
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-base font-medium truncate">{doc.fileName}</p>
                {doc.fileSizeBytes != null && (
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(doc.fileSizeBytes)}
                  </p>
                )}
              </div>
            </div>

            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="shrink-0 inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Download {doc.fileName}</span>
            </a>
          </div>

          {index < documents.length - 1 && <Separator />}
        </li>
      ))}
    </ul>
  );
}
