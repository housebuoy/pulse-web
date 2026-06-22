"use client";

import { Video, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { actionsFor, formatTime } from "@/lib/appointment-utils";
import type {
  Appointment,
  AppointmentStatus,
} from "@/lib/types/appointments";

export function AppointmentRow({
  appointment,
  onAction,
  isMutating,
}: {
  appointment: Appointment;
  onAction: (id: string, next: AppointmentStatus) => void;
  isMutating: boolean;
}) {
  const actions = actionsFor(appointment.status);
  const isEmergency = appointment.priority === "emergency";

  return (
    <div className="grid grid-cols-12 items-center gap-4 px-5 py-4">
      {/* Time */}
      <div className="col-span-2 lg:col-span-1">
        <div className="text-sm font-semibold tabular-nums text-fg">
          {formatTime(appointment.scheduledAt)}
        </div>
        <div className="text-xs text-fg-muted">
          {appointment.durationMinutes}m
        </div>
      </div>

      {/* Patient + reason */}
      <div className="col-span-10 lg:col-span-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-fg">
            {appointment.patientName}
          </span>
          {isEmergency && (
            <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-danger">
              <AlertTriangle className="h-3 w-3" />
              Emergency
            </span>
          )}
        </div>
        <div className="truncate text-xs text-fg-muted">
          {appointment.reference}
          {appointment.reason ? ` · ${appointment.reason}` : ""}
        </div>
      </div>

      {/* Department */}
      <div className="col-span-4 hidden text-sm text-fg lg:block lg:col-span-2">
        {appointment.departmentName}
      </div>

      {/* Doctor + type */}
      <div className="col-span-4 hidden lg:block lg:col-span-2">
        <div className="text-sm text-fg">{appointment.doctorName}</div>
        <div className="flex items-center gap-1 text-xs text-fg-muted">
          {appointment.type === "virtual" ? (
            <>
              <Video className="h-3 w-3" /> Virtual
            </>
          ) : (
            "In person"
          )}
        </div>
      </div>

      {/* Status */}
      <div className="col-span-4 lg:col-span-2">
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      {/* Actions */}
      <div
        className={cn(
          "col-span-8 flex items-center justify-end gap-2 lg:col-span-2",
          actions.length === 0 && "opacity-0 pointer-events-none"
        )}
      >
        {actions.map((action) => (
          <Button
            key={action.key}
            size="sm"
            variant={action.variant}
            disabled={isMutating}
            onClick={() => onAction(appointment.id, action.next)}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}