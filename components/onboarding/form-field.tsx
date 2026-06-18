import type { ReactNode } from "react";

export function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-label text-fg-secondary">
        {label}
      </label>
      {children}
      {error && <p className="text-caption text-destructive">{error}</p>}
    </div>
  );
}
