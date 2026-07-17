"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addDays, isToday, toDateKey } from "@/lib/appointment-utils";
import { formatLongDate } from "@/lib/format";
import { formatWeekRange, formatMonthYear } from "@/lib/calendar-utils";
import type { AppointmentView } from "@/components/dashboard/appointments/view-switcher";

export function AppointmentDateNav({
  date,
  onChange,
  view = "list",
}: {
  date: string;
  onChange: (date: string) => void;
  view?: AppointmentView;
}) {
  const [open, setOpen] = useState(false);
  const selected = new Date(`${date}T00:00:00`);

  const step = view === "month" ? 30 : view === "week" ? 7 : 1;

  const label =
    view === "month"
      ? formatMonthYear(date)
      : view === "week"
        ? formatWeekRange(date)
        : formatLongDate(date);

  const showToday = view === "list" && !isToday(date);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-lg border border-border bg-surface">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-r-none"
          aria-label={`Previous ${view}`}
          onClick={() => onChange(addDays(date, -step))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex min-w-56 items-center justify-center gap-2 px-2 text-sm font-medium text-fg"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-fg-muted" />
              {label}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              className="text-fg"
              selected={selected}
              onSelect={(d) => {
                if (d) {
                  onChange(toDateKey(d));
                  setOpen(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-l-none"
          aria-label={`Next ${view}`}
          onClick={() => onChange(addDays(date, step))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {showToday && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(toDateKey(new Date()))}
        >
          Today
        </Button>
      )}
    </div>
  );
}
