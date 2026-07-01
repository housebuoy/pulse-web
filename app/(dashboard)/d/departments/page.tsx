"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DepartmentListRail } from "@/components/dashboard/departments/department-list-rail";
import { DepartmentDetail } from "@/components/dashboard/departments/department-detail";
import { DepartmentFormDialog } from "@/components/dashboard/departments/department-form-dialog";
import { LiveStatusIndicator } from "@/components/dashboard/live-status-indicator";
import { useDepartments, useDepartmentStats } from "@/hooks/use-departments";
import { matchesSearch } from "@/lib/department-utils";

// "archived" is a soft-delete state and never surfaces as a selectable tab.
type StatusFilter = "all" | "active" | "closed";

function DepartmentsBody() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedId = searchParams.get("dept");
  const query = searchParams.get("q") ?? "";

  const [status, setStatus] = useState<StatusFilter>("all");
  const [addOpen, setAddOpen] = useState(false);

  const { data: all = [], isLoading } = useDepartments();
  const { data: stats } = useDepartmentStats();

  const visibleAll = useMemo(
    () => all.filter((d) => d.status !== "archived"),
    [all],
  );

  const counts = useMemo<Record<StatusFilter, number>>(
    () => ({
      all: visibleAll.length,
      active: visibleAll.filter((d) => d.status === "active").length,
      closed: visibleAll.filter((d) => d.status === "closed").length,
    }),
    [visibleAll],
  );

  const filtered = useMemo(
    () =>
      visibleAll.filter(
        (d) => (status === "all" || d.status === status) && matchesSearch(d, query),
      ),
    [visibleAll, status, query],
  );

  const selected = visibleAll.find((d) => d.id === selectedId) ?? null;

  const buildUrl = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    return `${pathname}${params.toString() ? `?${params}` : ""}`;
  };

  useEffect(() => {
    if (isLoading || selected || filtered.length === 0) return;
    router.replace(buildUrl((p) => p.set("dept", filtered[0].id)), {
      scroll: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, selected, filtered]);

  const handleSelect = (id: string) => {
    router.push(buildUrl((p) => p.set("dept", id)), { scroll: false });
  };

  const handleRemoved = () => {
    router.push(buildUrl((p) => p.delete("dept")), { scroll: false });
  };

  const s = stats ?? { total: 0, active: 0, doctorsOnDuty: 0, waiting: 0 };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-3">
      {/* Slim rollup — replaces the full-width facility summary band */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-sm text-fg-muted">
          <span>
            <span className="font-semibold tabular-nums text-fg">{s.total}</span>
            {" "}dept{s.total !== 1 ? "s" : ""}
          </span>
          <span>
            <span className="font-semibold tabular-nums text-success">{s.active}</span>
            {" "}active
          </span>
          <span>
            <span className="font-semibold tabular-nums text-fg">{s.doctorsOnDuty}</span>
            {" "}on duty
          </span>
          <span>
            <span className="font-semibold tabular-nums text-fg">{s.waiting}</span>
            {" "}waiting
          </span>
        </div>
        <LiveStatusIndicator interval="10s" />
      </div>

      {/* Single bordered card — rail + detail share one container */}
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-surface">
        <DepartmentListRail
          departments={filtered}
          selectedId={selectedId}
          status={status}
          onStatusChange={setStatus}
          counts={counts}
          onSelect={handleSelect}
          onAdd={() => setAddOpen(true)}
          isLoading={isLoading}
        />

        {selected ? (
          <DepartmentDetail department={selected} onRemoved={handleRemoved} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-fg-muted">
            {isLoading ? "Loading departments…" : "Select a department."}
          </div>
        )}
      </div>

      <DepartmentFormDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

export default function DepartmentsPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="Departments" />
      <Suspense fallback={<div className="flex-1" />}>
        <DepartmentsBody />
      </Suspense>
    </div>
  );
}
