"use client";

import { CalendarX2 } from "lucide-react";
import { AppointmentRow } from "./appointment-row";
import type {
  Appointment,
  AppointmentStatus,
} from "@/lib/types/appointments";

function HeaderRow() {
  return (
    <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface-subtle px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
      <div className="col-span-2 lg:col-span-1">Time</div>
      <div className="col-span-10 lg:col-span-3">Patient</div>
      <div className="col-span-4 hidden lg:block lg:col-span-2">Department</div>
      <div className="col-span-4 hidden lg:block lg:col-span-2">Doctor</div>
      <div className="col-span-4 lg:col-span-2">Status</div>
      <div className="col-span-8 text-right lg:col-span-2">Actions</div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 items-center gap-4 px-5 py-4">
      <div className="col-span-2 lg:col-span-1 h-4 w-12 rounded bg-surface-muted" />
      <div className="col-span-10 lg:col-span-3 h-4 w-40 rounded bg-surface-muted" />
      <div className="col-span-4 hidden lg:block lg:col-span-2 h-4 w-24 rounded bg-surface-muted" />
      <div className="col-span-4 hidden lg:block lg:col-span-2 h-4 w-20 rounded bg-surface-muted" />
      <div className="col-span-4 lg:col-span-2 h-5 w-20 rounded-full bg-surface-muted" />
      <div className="col-span-8 lg:col-span-2 ml-auto h-8 w-24 rounded bg-surface-muted" />
    </div>
  );
}

export function AppointmentList({
  appointments,
  isLoading,
  isMutating,
  onAction,
}: {
  appointments: Appointment[];
  isLoading: boolean;
  isMutating: boolean;
  onAction: (id: string, next: AppointmentStatus) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <HeaderRow />

      {isLoading && appointments.length === 0 ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
            <CalendarX2 className="h-6 w-6 text-fg-muted" />
          </div>
          <div>
            <p className="font-medium text-fg">No appointments</p>
            <p className="text-sm text-fg-muted">
              Nothing scheduled for this day with the current filters.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {appointments.map((appointment) => (
            <AppointmentRow
              key={appointment.id}
              appointment={appointment}
              onAction={onAction}
              isMutating={isMutating}
            />
          ))}
        </div>
      )}
    </div>
  );
}