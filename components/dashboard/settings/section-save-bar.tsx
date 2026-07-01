import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SectionSaveBar({
  isDirty,
  isSaving,
  justSaved,
}: {
  isDirty: boolean;
  isSaving: boolean;
  /** Pass `true` for ~2 s after a successful save to show the ✓ confirmation. */
  justSaved?: boolean;
}) {
  const label = isSaving
    ? "Saving…"
    : isDirty
      ? "Unsaved changes"
      : justSaved
        ? "Saved"
        : "";

  return (
    <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
      {label && (
        <span
          className={cn(
            "flex items-center gap-1.5 text-sm",
            justSaved && !isDirty && !isSaving
              ? "text-success"
              : isDirty
                ? "text-warning"
                : "text-fg-muted",
          )}
        >
          {justSaved && !isDirty && !isSaving && (
            <CheckCircle className="size-4" />
          )}
          {label}
        </span>
      )}
      <Button type="submit" size="sm" disabled={!isDirty || isSaving}>
        {isSaving ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
