"use client";

import { FilterPill, FilterTab } from "@/components/dashboard/filter-tabs";
import type {
  AppointmentDepartment,
  AppointmentStatus,
} from "@/lib/types/appointments";

const STATUS_OPTIONS: { value: AppointmentStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked in" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
];

export function AppointmentFilters({
  departments,
  departmentId,
  onDepartmentChange,
  status,
  onStatusChange,
  total,
  counts,
}: {
  departments: AppointmentDepartment[];
  departmentId: string;
  onDepartmentChange: (id: string) => void;
  status: AppointmentStatus | "all";
  onStatusChange: (status: AppointmentStatus | "all") => void;
  total: number;
  counts: Record<string, number>;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <FilterTab
          active={departmentId === "all"}
          label="All Departments"
          count={total}
          onClick={() => onDepartmentChange("all")}
        />
        {departments.map((d) => (
          <FilterTab
            key={d.id}
            active={departmentId === d.id}
            label={d.name}
            count={counts[d.id] ?? 0}
            onClick={() => onDepartmentChange(d.id)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-medium text-fg-muted">Status</span>
        {STATUS_OPTIONS.map((opt) => (
          <FilterPill
            key={opt.value}
            active={status === opt.value}
            label={opt.label}
            onClick={() => onStatusChange(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}
