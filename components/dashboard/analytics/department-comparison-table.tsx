"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";
import type { DepartmentAnalytics } from "@/lib/types/analytics";

type SortKey = "patientVolume" | "avgWaitMinutes" | "utilization";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "patientVolume", label: "Patient volume" },
  { key: "avgWaitMinutes", label: "Avg wait" },
  { key: "utilization", label: "Utilization" },
];

function valueOf(d: DepartmentAnalytics, key: SortKey): number {
  if (key === "patientVolume") return d.totals.patientVolume;
  if (key === "avgWaitMinutes") return d.totals.avgWaitMinutes;
  return d.utilization;
}

export function DepartmentComparisonTable({
  departments,
  onSelectDepartment,
}: {
  departments: DepartmentAnalytics[];
  onSelectDepartment: (departmentId: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("patientVolume");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    return [...departments].sort((a, b) =>
      sortDir === "desc"
        ? valueOf(b, sortKey) - valueOf(a, sortKey)
        : valueOf(a, sortKey) - valueOf(b, sortKey),
    );
  }, [departments, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface-subtle px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
        <div className="col-span-4">Department</div>
        {COLUMNS.map((col) => (
          <button
            key={col.key}
            type="button"
            onClick={() => toggleSort(col.key)}
            className="col-span-2 flex items-center justify-end gap-1 text-right hover:text-fg-secondary"
          >
            {col.label}
            {sortKey === col.key &&
              (sortDir === "desc" ? (
                <ArrowDown className="size-3" />
              ) : (
                <ArrowUp className="size-3" />
              ))}
          </button>
        ))}
        <div className="col-span-2 text-right">View</div>
      </div>

      <ul className="divide-y divide-border">
        {sorted.map((d) => (
          <li key={d.departmentId}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => onSelectDepartment(d.departmentId)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSelectDepartment(d.departmentId);
              }}
              className="grid w-full cursor-pointer grid-cols-12 items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface-subtle"
            >
              <span className="col-span-4 truncate text-sm font-medium text-fg">
                {d.departmentName}
              </span>
              <span className="col-span-2 text-right text-sm tabular-nums text-fg-secondary">
                {d.totals.patientVolume}
              </span>
              <span className="col-span-2 text-right text-sm tabular-nums text-fg-secondary">
                {d.totals.avgWaitMinutes}m
              </span>
              <span className="col-span-2 text-right text-sm tabular-nums text-fg-secondary">
                {d.utilization}%
              </span>
              <span className="col-span-2 flex justify-end">
                <Link
                  href={`/d/departments?dept=${d.departmentId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                >
                  Departments
                  <ExternalLink className="size-3" />
                </Link>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
