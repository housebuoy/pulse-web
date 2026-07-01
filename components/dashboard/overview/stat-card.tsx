import type { LucideIcon } from "lucide-react";
import type { StatMetric } from "@/lib/types/dashboard";
import { StatTile } from "@/components/dashboard/shared/stat-tile";

/**
 * Individual KPI card — flat card wrapping a single StatTile.
 * Used on the Overview page where each metric lives in its own box.
 * Analytics uses StatBar instead (all tiles in one divided band).
 */
export function StatCard({
  metric,
  icon,
}: {
  metric: StatMetric;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <StatTile
        label={metric.label}
        value={metric.value}
        unit={metric.unit}
        delta={metric.trend}
        icon={icon}
      />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
      <div className="h-2.5 w-24 animate-pulse rounded bg-surface-muted" />
      <div className="h-5 w-16 animate-pulse rounded bg-surface-muted" />
      <div className="h-4 w-14 animate-pulse rounded-full bg-surface-muted" />
    </div>
  );
}
