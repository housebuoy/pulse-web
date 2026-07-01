"use client";

import { cn } from "@/lib/utils";
import { DUTY_META } from "@/lib/staff-utils";
import type { DutyStatus } from "@/lib/types/staff";

const OPTIONS: DutyStatus[] = ["on_duty", "off_duty", "on_leave"];

// A third, real duty state (on leave) — not just an on/off toggle — so the
// same control works as a tri-state segmented switch on the staff file page.
export function DutyControl({
  value,
  onChange,
  disabled,
}: {
  value: DutyStatus;
  onChange: (status: DutyStatus) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex w-fit items-center gap-1 rounded-md bg-surface-muted p-1">
      {OPTIONS.map((status) => {
        const active = value === status;
        return (
          <button
            key={status}
            type="button"
            disabled={disabled}
            onClick={() => onChange(status)}
            className={cn(
              "rounded-sm px-3 py-1.5 text-body-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
              active
                ? "bg-surface text-fg shadow-input"
                : "text-fg-muted hover:text-fg-secondary",
            )}
          >
            {DUTY_META[status].label}
          </button>
        );
      })}
    </div>
  );
}
