import { cn } from "@/lib/utils";

export function FilterTab({
  active,
  label,
  count,
  dotClassName,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  dotClassName?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand/30 bg-brand/10 text-brand"
          : "border-border bg-transparent text-fg-secondary hover:bg-surface-muted",
      )}
    >
      {dotClassName && (
        <span className={cn("size-1.5 rounded-full", dotClassName)} />
      )}
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "rounded-full px-1.5 text-xs tabular-nums",
            active ? "bg-brand/15 text-brand" : "bg-surface-muted text-fg-muted",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-brand/10 text-brand"
          : "text-fg-muted hover:bg-surface-muted",
      )}
    >
      {label}
    </button>
  );
}
