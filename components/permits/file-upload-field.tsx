"use client";

import { useRef, useState } from "react";
import { FileText, Image, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadFieldProps {
  documentType: string;
  label: string;
  accept: string;
  maxSizeMB?: number;
  required?: boolean;
  value?: File | null;
  onChange: (file: File | null) => void;
  hint?: string;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildAcceptHint(accept: string): string {
  const hasPdf = accept.includes("application/pdf");
  const hasImage =
    accept.includes("image/jpeg") ||
    accept.includes("image/png") ||
    accept.includes("image/*");
  if (hasPdf && hasImage) return "PDF, JPG, PNG — max 10MB";
  if (hasPdf) return "PDF only — max 10MB";
  return "Max 10MB";
}

export function FileUploadField({
  documentType,
  label,
  accept,
  maxSizeMB = 10,
  required = false,
  value,
  onChange,
  hint,
  className,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const maxBytes = maxSizeMB * 1024 * 1024;

  function validateAndSet(file: File) {
    // Validate MIME type against accept string
    const acceptedTypes = accept.split(",").map((t) => t.trim());
    const typeMatch = acceptedTypes.some((type) => {
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.replace("/*", "/"));
      }
      return file.type === type;
    });

    if (!typeMatch) {
      setSizeError(`Invalid file type. Accepted: ${buildAcceptHint(accept)}`);
      return;
    }

    if (file.size > maxBytes) {
      setSizeError(
        `File exceeds ${maxSizeMB}MB limit (${formatBytes(file.size)})`,
      );
      return;
    }

    setSizeError(null);
    onChange(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
    // Reset input so the same file can be re-selected after removal
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  }

  function handleRemove() {
    setSizeError(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const isImage = value && value.type.startsWith("image/");

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-base font-medium">
          {label}
          {required && (
            <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {value && (
          <span className="max-w-[200px] truncate text-sm text-muted-foreground">
            {value.name}
          </span>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        id={`file-upload-${documentType}`}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleInputChange}
        aria-label={label}
      />

      {!value ? (
        /* ── Empty state — upload area ── */
        <div
          role="button"
          tabIndex={0}
          aria-label={`Upload ${label}`}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-1",
            "rounded-lg border-2 border-dashed p-1 text-center transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30 hover:border-primary",
          )}
        >
          <Upload
            className="h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-base text-muted-foreground">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-muted-foreground">
            {buildAcceptHint(accept)}
          </p>
        </div>
      ) : (
        /* ── File selected state ── */
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
          {isImage ? (
            <Image
              className="h-6 w-6 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          ) : (
            <FileText
              className="h-6 w-6 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium">{value.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatBytes(value.size)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="shrink-0 text-destructive hover:text-destructive"
            aria-label={`Remove ${value.name}`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Hint text */}
      {hint && !sizeError && (
        <p className="text-sm text-muted-foreground">{hint}</p>
      )}

      {/* Size / type error */}
      {sizeError && (
        <p className="text-sm text-destructive" role="alert">
          {sizeError}
        </p>
      )}
    </div>
  );
}
