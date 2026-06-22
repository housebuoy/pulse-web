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
import {
  addDays,
  formatLongDate,
  isToday,
  toDateKey,
} from "@/lib/appointment-utils";

export function AppointmentDateNav({
  date,
  onChange,
}: {
  date: string;
  onChange: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = new Date(`${date}T00:00:00`);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-lg border border-border bg-surface">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-r-none"
          aria-label="Previous day"
          onClick={() => onChange(addDays(date, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex min-w-[16rem] items-center justify-center gap-2 px-2 text-sm font-medium text-fg"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-fg-muted" />
              {formatLongDate(date)}
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
          aria-label="Next day"
          onClick={() => onChange(addDays(date, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {!isToday(date) && (
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