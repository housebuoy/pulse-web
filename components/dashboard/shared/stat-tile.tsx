import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatTrend } from "@/lib/types/dashboard";

export interface StatTileProps {
  label: string;
  value: string | number;
  /**
   * Short suffix appended directly to the value with no space: "m", "%".
   * Rendered in the same span as the number so font-metric differences
   * never create a perceived gap ("44m", "6.5%", not "44 m" or "6.5 %").
   */
  unit?: string;
  delta?: StatTrend;
  icon?: LucideIcon;
  valueTone?: "warning" | "danger";
  isLoading?: boolean;
}

const SENTIMENT: Record<StatTrend["sentiment"], string> = {
  positive: "text-success bg-success/10",
  negative: "text-danger bg-danger/10",
  neutral: "text-fg-muted bg-surface-muted",
};

export function StatTile({
  label,
  value,
  unit,
  delta,
  icon: Icon,
  valueTone,
  isLoading,
}: StatTileProps) {
  const DeltaIcon = delta?.direction === "up" ? ArrowUp : ArrowDown;

  // Concatenate unit into the same text node so there is exactly ONE rendered
  // glyph sequence — no adjacent-span spacing, no font-metric gap.
  const display = isLoading ? "—" : unit ? `${value}${unit}` : String(value);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
          {label}
        </span>
        {Icon && <Icon className="size-3.5 shrink-0 text-fg-placeholder" />}
      </div>

      {/*
       * Use an explicit [font-variant-numeric:tabular-nums] arbitrary property
       * instead of the Tailwind `tabular-nums` utility class.
       *
       * Tailwind v4's `tabular-nums` composes font-variant-numeric via several
       * CSS custom properties (--tw-ordinal, --tw-slashed-zero, …). When only
       * --tw-numeric-spacing is populated the others resolve to empty, which
       * some Chrome builds treat as IACVT (invalid-at-computed-value-time),
       * briefly flushing a stale paint frame that shows a ghost "1" digit
       * before the property resolves. Writing the CSS value directly avoids
       * the custom-property composition entirely.
       */}
      <span
        className={cn(
          "text-[17px] font-bold leading-none [font-variant-numeric:tabular-nums]",
          valueTone === "warning"
            ? "text-warning"
            : valueTone === "danger"
              ? "text-danger"
              : "text-fg",
        )}
      >
        {display}
      </span>

      {delta && !isLoading && (
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
            SENTIMENT[delta.sentiment],
          )}
        >
          <DeltaIcon className="size-2.5" />
          {delta.label}
        </span>
      )}
    </div>
  );
}

export function StatTileSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-2.5 w-14 animate-pulse rounded bg-surface-muted" />
      <div className="h-[17px] w-10 animate-pulse rounded bg-surface-muted" />
    </div>
  );
}
