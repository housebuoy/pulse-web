"use client";

import { CloudUpload } from "lucide-react";

export function FileUpload({
  id,
  value,
  onChange,
  accept,
  hint,
}: {
  value: File | null;
  id: string;
  onChange: (file: File) => void;
  accept?: string;
  hint?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-subtle p-8 transition-colors hover:bg-surface-muted"
    >
      <CloudUpload className="mb-3 h-8 w-8 text-fg-placeholder" />
      {value ? (
        <p className="text-label text-brand">{value.name}</p>
      ) : (
        <>
          <p className="mb-1 text-body-sm text-fg-muted">
            <span className="text-brand">Click to upload</span> or drag and drop
          </p>
          {hint && <p className="text-caption text-fg-placeholder">{hint}</p>}
        </>
      )}
      <input
        id="documentUpload"
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onChange(e.target.files[0]);
          }
        }}
      />
    </label>
  );
}
