"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { actionsFor, STATUS_META } from "@/lib/appointment-utils";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Appointment, AppointmentStatus } from "@/lib/types/appointments";

const BLOCK_BG: Record<AppointmentStatus, string> = {
  confirmed: "bg-brand/8 border-brand/20 text-brand",
  checked_in: "bg-success/8 border-success/20 text-success",
  no_show: "bg-warning/8 border-warning/20 text-warning",
  scheduled: "bg-surface-muted border-border text-fg-muted",
  completed: "bg-surface-muted border-border text-fg-placeholder",
  cancelled: "bg-danger/8 border-danger/20 text-danger",
};

export function AppointmentBlock({
  appointment: a,
  onAction,
  isMutating,
  compact = false,
}: {
  appointment: Appointment;
  onAction?: (id: string, next: AppointmentStatus) => void;
  isMutating?: boolean;
  compact?: boolean;
}) {
  const actions = actionsFor(a.status);
  const { label } = STATUS_META[a.status];
  const time = formatTime(a.scheduledAt);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full truncate rounded border px-1.5 py-0.5 text-left leading-tight transition-opacity hover:opacity-80",
            compact ? "text-[11px]" : "text-xs",
            BLOCK_BG[a.status],
          )}
        >
          <span className="font-medium">{time}</span>
          {" "}
          {a.patientName.split(" ")[0]}
        </button>
      </PopoverTrigger>

      <PopoverContent side="right" align="start" className="w-64 p-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-fg">{a.patientName}</p>
            <p className="text-xs text-fg-muted">{a.reference}</p>
          </div>

          <div className="space-y-1 text-xs text-fg-secondary">
            <p>
              <span className="text-fg-muted">Time</span>{" "}
              {time} · {a.durationMinutes} min
            </p>
            <p>
              <span className="text-fg-muted">Dept</span>{" "}
              {a.departmentName}
            </p>
            <p>
              <span className="text-fg-muted">Doctor</span>{" "}
              {a.doctorName}
            </p>
            {a.reason && (
              <p>
                <span className="text-fg-muted">Reason</span>{" "}
                {a.reason}
              </p>
            )}
          </div>

          <StatusBadge tone={STATUS_META[a.status].tone} label={label} />

          {onAction && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-border pt-3">
              {actions.map((act) => (
                <Button
                  key={act.key}
                  size="sm"
                  variant={act.variant === "default" ? "default" : act.variant}
                  disabled={isMutating}
                  onClick={() => onAction(a.id, act.next)}
                  className={
                    act.variant === "default"
                      ? "bg-brand text-white hover:bg-brand/90"
                      : ""
                  }
                >
                  {act.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
