import { LiveStatusIndicator } from "@/components/dashboard/live-status-indicator";
import { MetricStat } from "@/components/dashboard/metric-stat";
import type { DepartmentStats } from "@/lib/types/departments";

export function DepartmentSummary({
  stats,
  isLoading,
}: {
  stats?: DepartmentStats;
  isLoading?: boolean;
}) {
  const s = stats ?? {
    total: 0,
    active: 0,
    closed: 0,
    doctorsOnDuty: 0,
    rooms: 0,
    waiting: 0,
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
        <MetricStat value={s.total} label="Departments" isLoading={isLoading} />
        <MetricStat value={s.active} label="Active" isLoading={isLoading} />
        <MetricStat
          value={s.doctorsOnDuty}
          label="Doctors on duty"
          isLoading={isLoading}
        />
        <MetricStat value={s.rooms} label="Rooms" isLoading={isLoading} />
        <MetricStat value={s.waiting} label="Waiting now" isLoading={isLoading} />
      </div>
      <LiveStatusIndicator interval="10s" />
    </div>
  );
}
