"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterTab } from "@/components/dashboard/filter-tabs";
import type { DepartmentStatus } from "@/lib/types/departments";

type StatusFilter = DepartmentStatus | "all";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

export function DepartmentFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  counts,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <FilterTab
            key={opt.value}
            active={status === opt.value}
            label={opt.label}
            count={counts[opt.value]}
            onClick={() => onStatusChange(opt.value)}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-placeholder" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search departments…"
            className="h-9 w-64 rounded-lg border border-border bg-surface-subtle pl-9 pr-3 text-sm text-fg outline-none placeholder:text-fg-placeholder focus-visible:ring-2 focus-visible:ring-brand"
          />
        </div>

        <Button asChild size="sm">
          <Link href="/d/departments/new">
            <Plus className="size-4" />
            Add Department
          </Link>
        </Button>
      </div>
    </div>
  );
}
