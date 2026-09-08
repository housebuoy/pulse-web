"use client";

import { Video, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { actionsFor } from "@/lib/appointment-utils";
import { formatTime } from "@/lib/format";
import type {
  Appointment,
  AppointmentStatus,
} from "@/lib/types/appointments";

export function AppointmentRow({
  appointment,
  onAction,
  onMarkPaid,
  isMutating,
}: {
  appointment: Appointment;
  onAction: (id: string, next: AppointmentStatus) => void;
  onMarkPaid?: (id: string) => void;
  isMutating: boolean;
}) {
  const actions = actionsFor(appointment.status);
  const isEmergency = appointment.priority === "emergency";
  const isPaid = appointment.paymentStatus === "paid";
  // Primary (filled) action always renders last so it hugs the row's right
  // edge — every primary sits on the same vertical line across all rows
  // regardless of how wide the secondary actions are.
  const primaryActions = actions.filter((a) => a.variant === "default");
  const secondaryActions = actions.filter((a) => a.variant !== "default");

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
        <span className="font-medium text-fg">{appointment.patientName}</span>
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
      <div className="col-span-4 flex items-center gap-2 lg:col-span-2">
        {isEmergency && (
          <AlertTriangle
            className="h-3.5 w-3.5 shrink-0 text-danger"
            aria-label="Emergency priority"
          />
        )}
        <AppointmentStatusBadge status={appointment.status} />
        {appointment.paymentStatus && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase leading-none",
              isPaid
                ? "bg-brand/10 text-brand"
                : "bg-warning/10 text-warning",
            )}
          >
            {isPaid ? "Paid" : "Unpaid"}
          </span>
        )}
      </div>

      {/* Actions */}
      <div
        className={cn(
          "col-span-8 flex items-center justify-end gap-3 lg:col-span-2",
          actions.length === 0 && !(onMarkPaid && !isPaid) && "opacity-0 pointer-events-none"
        )}
      >
        {onMarkPaid && !isPaid && (
          <Button
            size="sm"
            variant="outline"
            disabled={isMutating}
            onClick={() => onMarkPaid(appointment.id)}
          >
            Mark paid
          </Button>
        )}
        {secondaryActions.map((action) => (
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
        {primaryActions.map((action) => (
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