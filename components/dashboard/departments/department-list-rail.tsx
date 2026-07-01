"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadTone } from "@/lib/department-utils";
import { cn } from "@/lib/utils";
import type { Department } from "@/lib/types/departments";

type StatusFilter = "all" | "active" | "closed";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

const DOT_TONE: Record<"success" | "warning" | "danger", string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function DepartmentListRail({
  departments,
  selectedId,
  status,
  onStatusChange,
  counts,
  onSelect,
  onAdd,
  isLoading,
}: {
  departments: Department[];
  selectedId: string | null;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
  onSelect: (id: string) => void;
  onAdd: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex w-60 shrink-0 flex-col border-r border-border">
      {/* Compact toolbar: filter chips left, add button right */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex items-center gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusChange(opt.value)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                status === opt.value
                  ? "bg-brand/10 text-brand"
                  : "text-fg-muted hover:bg-surface-muted hover:text-fg-secondary",
              )}
            >
              {opt.label}
              {" "}
              <span className="tabular-nums opacity-60">{counts[opt.value]}</span>
            </button>
          ))}
        </div>
        <Button size="icon-xs" variant="ghost" aria-label="Add department" onClick={onAdd}>
          <Plus className="size-3.5" />
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto border-t border-border">
        {isLoading && departments.length === 0 ? (
          <div className="space-y-px p-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded bg-surface-muted" />
            ))}
          </div>
        ) : departments.length === 0 ? (
          <p className="p-4 text-xs text-fg-muted">No departments match.</p>
        ) : (
          <ul>
            {departments.map((d) => {
              const dotTone = d.status === "active" ? loadTone(d.waiting) : null;
              const selected = d.id === selectedId;
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(d.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 border-l-2 px-3 py-2.5 text-left transition-colors",
                      selected
                        ? "border-brand bg-brand/5"
                        : "border-transparent hover:bg-surface-subtle",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        dotTone ? DOT_TONE[dotTone] : "bg-fg-placeholder",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-[13px] font-medium leading-tight",
                          selected ? "text-brand" : "text-fg",
                        )}
                      >
                        {d.name}
                      </span>
                      <span className="block text-[11px] text-fg-muted">{d.code}</span>
                    </span>
                    {d.waiting > 0 && (
                      <span className="text-[11px] font-medium tabular-nums text-fg-muted">
                        {d.waiting}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
