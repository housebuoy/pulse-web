import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-fg-secondary",
  brand: "bg-brand/10 text-brand",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

export function StatusBadge({
  tone,
  label,
  dot = false,
}: {
  tone: BadgeTone;
  label: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}
