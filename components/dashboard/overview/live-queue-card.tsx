"use client";

import { useDepartmentQueue } from "@/hooks/use-dashboard";
import type { QueueSeverity } from "@/lib/types/dashboard";
import { cn } from "@/lib/utils";

const dotColor: Record<QueueSeverity, string> = {
  ok: "bg-success",
  warning: "bg-warning",
  critical: "bg-danger",
};

export function LiveQueueCard() {
  const { data: rows = [], isLoading } = useDepartmentQueue();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between p-5">
        <h2 className="text-base font-bold text-fg">Live Department Queue</h2>
        <button className="text-sm font-medium text-brand hover:underline">
          View All
        </button>
      </div>

      {/* column header */}
      <div className="grid grid-cols-[1fr_150px_70px_80px] gap-3 border-y border-border bg-surface-subtle px-5 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
          Department
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
          Status
        </span>
        <span className="text-right text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
          Waiting
        </span>
        <span className="text-right text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
          Max Wait
        </span>
      </div>

      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_150px_70px_80px] gap-3 border-b border-border px-5 py-3.5 last:border-0"
            >
              <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
              <div className="ml-auto h-4 w-6 animate-pulse rounded bg-surface-muted" />
              <div className="ml-auto h-4 w-10 animate-pulse rounded bg-surface-muted" />
            </div>
          ))
        : rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1fr_150px_70px_80px] items-center gap-3 border-b border-border px-5 py-3.5 last:border-0"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn("size-2 rounded-full", dotColor[row.severity])}
                />
                <span className="text-sm font-medium text-fg">
                  {row.department}
                </span>
              </div>
              <span className="text-sm text-fg-muted">{row.statusLabel}</span>
              <span className="text-right text-sm font-medium text-fg">
                {row.waiting}
              </span>
              <span
                className={cn(
                  "text-right text-sm font-medium",
                  row.severity === "critical" ? "text-danger" : "text-fg-secondary",
                )}
              >
                {row.maxWaitMinutes}m
              </span>
            </div>
          ))}
    </div>
  );
}