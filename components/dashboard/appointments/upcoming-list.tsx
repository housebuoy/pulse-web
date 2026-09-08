"use client";

// "Upcoming" default view: all future bookings grouped by day — no date
// picker needed to see what's coming. Reuses the standard row/list layout.

import { useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { AppointmentList } from "./appointment-list";
import { toDateKey } from "@/lib/appointment-utils";
import type {
  Appointment,
  AppointmentStatus,
} from "@/lib/types/appointments";

function dayLabel(dateKey: string): string {
  const today = toDateKey(new Date());
  if (dateKey === today) return "Today";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateKey === toDateKey(tomorrow)) return "Tomorrow";
  const d = new Date(`${dateKey}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function UpcomingList({
  appointments,
  isLoading = false,
  isMutating,
  onAction,
  onMarkPaid,
}: {
  appointments: Appointment[];
  isLoading?: boolean;
  isMutating: boolean;
  onAction: (id: string, next: AppointmentStatus) => void;
  onMarkPaid?: (id: string) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const key = toDateKey(new Date(a.scheduledAt));
      const list = map.get(key) ?? [];
      list.push(a);
      map.set(key, list);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, day]) => ({ date, appointments: day }));
  }, [appointments]);

  if (isLoading && appointments.length === 0) {
    return (
      <AppointmentList
        appointments={[]}
        isLoading
        isMutating={isMutating}
        onAction={onAction}
        onMarkPaid={onMarkPaid}
      />
    );
  }

  if (groups.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
            <CalendarClock className="h-6 w-6 text-fg-muted" />
          </div>
          <div>
            <p className="font-medium text-fg">No upcoming appointments</p>
            <p className="text-sm text-fg-muted">
              Future bookings will appear here as they are made.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(({ date, appointments: day }) => (
        <section key={date}>
          <h3 className="mb-2 text-sm font-bold text-fg">{dayLabel(date)}</h3>
          <AppointmentList
            appointments={day}
            isLoading={false}
            isMutating={isMutating}
            onAction={onAction}
            onMarkPaid={onMarkPaid}
          />
        </section>
      ))}
    </div>
  );
}
