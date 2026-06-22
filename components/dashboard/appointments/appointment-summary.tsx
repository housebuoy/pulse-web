import { LiveStatusIndicator } from "@/components/dashboard/live-status-indicator";
import { MetricStat } from "@/components/dashboard/metric-stat";
import type { AppointmentStats } from "@/lib/types/appointments";

export function AppointmentSummary({
  stats,
  isLoading,
}: {
  stats?: AppointmentStats;
  isLoading?: boolean;
}) {
  const s = stats ?? {
    total: 0,
    scheduled: 0,
    confirmed: 0,
    checkedIn: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
        <MetricStat value={s.total} label="Total" isLoading={isLoading} />
        <MetricStat value={s.confirmed} label="Confirmed" isLoading={isLoading} />
        <MetricStat value={s.checkedIn} label="Checked in" isLoading={isLoading} />
        <MetricStat value={s.completed} label="Completed" isLoading={isLoading} />
        <MetricStat value={s.noShow} label="No-show" isLoading={isLoading} />
      </div>
      <LiveStatusIndicator interval="30s" />
    </div>
  );
}
