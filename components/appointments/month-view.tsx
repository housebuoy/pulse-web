"use client";

import { useMemo } from "react";
import { getMonthCalendarDates } from "@/lib/calendar-utils";
import { toDateKey } from "@/lib/appointment-utils";
import { cn } from "@/lib/utils";
import { AppointmentBlock } from "./appointment-block";
import type { Appointment, AppointmentStatus } from "@/lib/types/appointments";

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE = 3;

export function MonthView({
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
  const calDates = useMemo(() => getMonthCalendarDates(date), [date]);
  const monthPrefix = date.slice(0, 7); // "2026-07"
  const today = toDateKey(new Date());

  const byDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const d of calDates) {
      map[toDateKey(d)] = [];
    }
    for (const a of appointments) {
      const dk = toDateKey(new Date(a.scheduledAt));
      if (dk in map) map[dk].push(a);
    }
    return map;
  }, [appointments, calDates]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAY_HEADERS.map((d, i) => (
          <div
            key={d}
            className={cn(
              "py-2 text-center text-[11px] font-bold uppercase tracking-wide text-fg-placeholder",
              i > 0 && "border-l border-border",
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid — 6 rows × 7 cols */}
      <div className="grid grid-cols-7">
        {calDates.map((cellDate, idx) => {
          const dk = toDateKey(cellDate);
          const isThisMonth = dk.slice(0, 7) === monthPrefix;
          const isToday = dk === today;
          const isSelected = dk === date;
          const appts = byDate[dk] ?? [];
          const overflow = appts.length - MAX_VISIBLE;

          return (
            <div
              key={dk}
              className={cn(
                "min-h-24 border-b border-r border-border p-1.5",
                // Remove right border on last column and bottom on last row
                (idx + 1) % 7 === 0 && "border-r-0",
                idx >= 35 && "border-b-0",
                !isThisMonth && "bg-surface-subtle/50",
                isSelected && "ring-1 ring-inset ring-brand/30",
              )}
            >
              {/* Day number */}
              <div className="mb-1 flex justify-end">
                <span
                  className={cn(
                    "inline-flex size-5 items-center justify-center rounded-full text-[11px] font-semibold",
                    isToday
                      ? "bg-brand text-white"
                      : isThisMonth
                        ? "text-fg-secondary"
                        : "text-fg-placeholder",
                  )}
                >
                  {cellDate.getDate()}
                </span>
              </div>

              {/* Appointment chips */}
              {isLoading ? null : (
                <div className="space-y-0.5">
                  {appts.slice(0, MAX_VISIBLE).map((a) => (
                    <AppointmentBlock
                      key={a.id}
                      appointment={a}
                      onAction={onAction}
                      isMutating={isMutating}
                      compact
                    />
                  ))}
                  {overflow > 0 && (
                    <p className="px-1 text-[10px] text-fg-muted">
                      +{overflow} more
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
