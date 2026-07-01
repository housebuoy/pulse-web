"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterPill, FilterTab } from "@/components/dashboard/filter-tabs";
import { ROLE_LABEL } from "@/lib/staff-utils";
import type { StaffRole } from "@/lib/types/staff";

type RoleFilter = StaffRole | "all";

const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "doctor", label: ROLE_LABEL.doctor },
  { value: "nurse", label: ROLE_LABEL.nurse },
  { value: "admin", label: ROLE_LABEL.admin },
];

export function StaffToolbar({
  departments,
  departmentId,
  onDepartmentChange,
  role,
  onRoleChange,
  counts,
  onAddStaff,
}: {
  departments: { id: string; name: string }[];
  departmentId: string;
  onDepartmentChange: (id: string) => void;
  role: RoleFilter;
  onRoleChange: (role: RoleFilter) => void;
  counts: Record<string, number>;
  onAddStaff: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FilterTab
            active={departmentId === "all"}
            label="All Departments"
            count={counts.all ?? 0}
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

        <Button size="sm" onClick={onAddStaff}>
          <Plus className="size-4" />
          New staff
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-medium text-fg-muted">Role</span>
        {ROLE_OPTIONS.map((opt) => (
          <FilterPill
            key={opt.value}
            active={role === opt.value}
            label={opt.label}
            onClick={() => onRoleChange(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}
