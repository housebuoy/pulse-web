import { cn } from "@/lib/utils";
import { STATUS_META } from "@/lib/appointment-utils";
import type { AppointmentStatusBreakdown } from "@/lib/types/analytics";
import type { AppointmentStatus } from "@/lib/types/appointments";

const TONE_BG: Record<string, string> = {
  neutral: "bg-fg-placeholder",
  brand: "bg-brand",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function StatusBreakdown({ data }: { data: AppointmentStatusBreakdown[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="space-y-3">
      {data.map((d) => {
        const tone = STATUS_META[d.status as AppointmentStatus]?.tone ?? "neutral";
        const pct = Math.round((d.count / total) * 100);
        return (
          <div key={d.status} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-sm text-fg-secondary">
              {d.label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <div
                className={cn("h-full rounded-full", TONE_BG[tone])}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-20 shrink-0 text-right text-sm tabular-nums text-fg-muted">
              {d.count} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}
