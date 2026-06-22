import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { StatMetric } from "@/lib/types/dashboard";
import { cn } from "@/lib/utils";

const sentimentStyles: Record<StatMetric["trend"]["sentiment"], string> = {
  positive: "text-success bg-success/10",
  negative: "text-danger bg-danger/10",
  neutral: "text-fg-muted bg-surface-muted",
};

export function StatCard({
  metric,
  icon: Icon,
}: {
  metric: StatMetric;
  icon: LucideIcon;
}) {
  const { label, value, unit, trend } = metric;
  const TrendIcon = trend.direction === "up" ? ArrowUp : ArrowDown;

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-placeholder">
          {label}
        </span>
        <Icon className="size-[18px] text-fg-placeholder" />
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold leading-none tracking-tight text-fg">
          {value}
        </span>
        {unit && <span className="text-sm text-fg-muted">{unit}</span>}
      </div>

      <span
        className={cn(
          "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
          sentimentStyles[trend.sentiment],
        )}
      >
        <TrendIcon className="size-3" />
        {trend.label}
      </span>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
      <div className="h-8 w-16 animate-pulse rounded bg-surface-muted" />
      <div className="h-5 w-14 animate-pulse rounded-full bg-surface-muted" />
    </div>
  );
}