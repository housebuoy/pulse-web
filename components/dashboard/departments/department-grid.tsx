"use client";

import { Building2 } from "lucide-react";
import { DepartmentCard } from "./department-card";
import type { Department, DepartmentStatus } from "@/lib/types/departments";

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-surface-muted" />
        <div className="space-y-2">
          <div className="h-4 w-28 animate-pulse rounded bg-surface-muted" />
          <div className="h-3 w-40 animate-pulse rounded bg-surface-muted" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-surface-muted" />
        ))}
      </div>
      <div className="mt-5 h-8 animate-pulse rounded bg-surface-muted" />
    </div>
  );
}

export function DepartmentGrid({
  departments,
  isLoading,
  isMutating,
  onToggle,
}: {
  departments: Department[];
  isLoading: boolean;
  isMutating: boolean;
  onToggle: (id: string, next: DepartmentStatus) => void;
}) {
  if (isLoading && departments.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-5 py-16 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
          <Building2 className="h-6 w-6 text-fg-muted" />
        </div>
        <div>
          <p className="font-medium text-fg">No departments</p>
          <p className="text-sm text-fg-muted">
            Nothing matches the current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {departments.map((department) => (
        <DepartmentCard
          key={department.id}
          department={department}
          onToggle={onToggle}
          isMutating={isMutating}
        />
      ))}
    </div>
  );
}
