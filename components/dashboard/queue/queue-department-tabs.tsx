"use client";

import type { DepartmentSeverity, QueueDepartment } from "@/lib/types/queue";
import { FilterTab } from "@/components/dashboard/filter-tabs";

const dotColor: Record<DepartmentSeverity, string> = {
  ok: "bg-success",
  warning: "bg-warning",
  critical: "bg-danger",
};

export function QueueDepartmentTabs({
  departments,
  value,
  onChange,
}: {
  departments: QueueDepartment[];
  value: string;
  onChange: (id: string) => void;
}) {
  const totalWaiting = departments.reduce((sum, d) => sum + d.waiting, 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterTab
        label="All Departments"
        count={totalWaiting}
        active={value === "all"}
        onClick={() => onChange("all")}
      />
      {departments.map((d) => (
        <FilterTab
          key={d.id}
          label={d.name}
          count={d.waiting}
          dotClassName={dotColor[d.severity]}
          active={value === d.id}
          onClick={() => onChange(d.id)}
        />
      ))}
    </div>
  );
}
