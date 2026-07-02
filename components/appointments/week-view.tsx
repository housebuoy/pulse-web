"use client";

import { useMemo } from "react";
import { getWeekDates } from "@/lib/calendar-utils";
import { toDateKey } from "@/lib/appointment-utils";
import { cn } from "@/lib/utils";
import { AppointmentBlock } from "./appointment-block";
import type { Appointment, AppointmentStatus } from "@/lib/types/appointments";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeekView({
  appointments,
  date,
  isLoading,
  isMutating,
  onAction,
}: {
  appointments: Appointment[];
  date: string;
  isLoading?: boolean;
  isMutating?: boolean;
  onAction?: (id: string, next: AppointmentStatus) => void;
}) {
  const weekDates = useMemo(() => getWeekDates(date), [date]);
  const today = toDateKey(new Date());

  const byDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const d of weekDates) map[d] = [];
    for (const a of appointments) {
      const dk = toDateKey(new Date(a.scheduledAt));
      if (dk in map) map[dk].push(a);
    }
    return map;
  }, [appointments, weekDates]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {/* Day header */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDates.map((d, i) => {
          const dateObj = new Date(`${d}T00:00:00`);
          const dayNum = dateObj.getDate();
          const isToday = d === today;
          const isSelected = d === date;
          return (
            <div
              key={d}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5",
                i > 0 && "border-l border-border",
                isSelected && "bg-brand/5",
              )}
            >
              <span className="text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
                {DAY_LABELS[i]}
              </span>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                  isToday
                    ? "bg-brand text-white"
                    : "text-fg-secondary",
                )}
              >
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* Columns */}
      <div className="grid min-h-64 grid-cols-7 divide-x divide-border">
        {weekDates.map((d, i) => {
          const appts = byDate[d] ?? [];
          const isToday = d === today;
          return (
            <div
              key={d}
              className={cn(
                "space-y-1 p-2",
                isToday && "bg-brand/[0.02]",
              )}
            >
              {isLoading ? (
                <div className="space-y-1">
                  {i === 0 &&
                    Array.from({ length: 3 }).map((_, j) => (
                      <div
                        key={j}
                        className="h-5 w-full animate-pulse rounded bg-surface-muted"
                      />
                    ))}
                </div>
              ) : appts.length === 0 ? null : (
                appts.map((a) => (
                  <AppointmentBlock
                    key={a.id}
                    appointment={a}
                    onAction={onAction}
                    isMutating={isMutating}
                    compact
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
