"use client";

import { useMemo, useState } from "react";
// ⚠️ Verify this import + prop against your existing live-queue / appointments page.
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DepartmentFilters } from "@/components/dashboard/departments/department-filters";
import { DepartmentSummary } from "@/components/dashboard/departments/department-summary";
import { DepartmentGrid } from "@/components/dashboard/departments/department-grid";
import {
  useDepartments,
  useDepartmentStats,
  useUpdateDepartment,
} from "@/hooks/use-departments";
import { matchesSearch } from "@/lib/department-utils";
import type { DepartmentStatus } from "@/lib/types/departments";

type StatusFilter = DepartmentStatus | "all";

export default function DepartmentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const { data: all = [], isLoading } = useDepartments();
  const { data: stats } = useDepartmentStats();
  const update = useUpdateDepartment();

  const counts = useMemo<Record<StatusFilter, number>>(
    () => ({
      all: all.length,
      active: all.filter((d) => d.status === "active").length,
      closed: all.filter((d) => d.status === "closed").length,
    }),
    [all]
  );

  const visible = useMemo(
    () =>
      all.filter(
        (d) =>
          (status === "all" || d.status === status) && matchesSearch(d, search)
      ),
    [all, status, search]
  );

  const handleToggle = (id: string, next: DepartmentStatus) =>
    update.mutate({ id, status: next });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="Departments" />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6 p-6">
          <DepartmentFilters
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            counts={counts}
          />

          <DepartmentSummary stats={stats} isLoading={isLoading} />

          <DepartmentGrid
            departments={visible}
            isLoading={isLoading}
            isMutating={update.isPending}
            onToggle={handleToggle}
          />
        </div>
      </div>
    </div>
  );
}