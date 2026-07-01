import { StatBar } from "@/components/dashboard/shared/stat-bar";
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
    doctorsOnDuty: 0,
    rooms: 0,
    waiting: 0,
  };

  return (
    <StatBar
      tiles={[
        { label: "Departments", value: s.total },
        { label: "Active", value: s.active },
        { label: "Doctors on duty", value: s.doctorsOnDuty },
        { label: "Rooms", value: s.rooms },
        { label: "Waiting now", value: s.waiting },
      ]}
      live="10s"
      isLoading={isLoading}
    />
  );
}
