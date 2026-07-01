import { StatBar } from "@/components/dashboard/shared/stat-bar";
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
    confirmed: 0,
    checkedIn: 0,
    completed: 0,
    noShow: 0,
  };

  return (
    <StatBar
      tiles={[
        { label: "Total", value: s.total },
        { label: "Confirmed", value: s.confirmed },
        { label: "Checked in", value: s.checkedIn },
        { label: "Completed", value: s.completed },
        { label: "No-show", value: s.noShow },
      ]}
      live="30s"
      isLoading={isLoading}
    />
  );
}
