"use client";

import { useEffect, useState } from "react";
import { CalendarClock, CalendarDays, CalendarRange, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppointmentView = "upcoming" | "list" | "week" | "month";

const STORAGE_KEY = "pulse_apt_view";
const VALID: AppointmentView[] = ["upcoming", "list", "week", "month"];

/** Persists the selected view across sessions. Defaults to "upcoming" so all
 *  future bookings are visible without picking a date. */
export function useAppointmentView(): [
  AppointmentView,
  (v: AppointmentView) => void,
] {
  const [view, setView] = useState<AppointmentView>("upcoming");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as AppointmentView | null;
    if (stored && VALID.includes(stored))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView(stored);
  }, []);

  const set = (v: AppointmentView) => {
    setView(v);
    localStorage.setItem(STORAGE_KEY, v);
  };

  return [view, set];
}

const OPTIONS = [
  { value: "upcoming" as const, icon: CalendarClock, label: "Upcoming" },
  { value: "list" as const, icon: LayoutList, label: "Day" },
  { value: "week" as const, icon: CalendarDays, label: "Week" },
  { value: "month" as const, icon: CalendarRange, label: "Month" },
];

export function ViewSwitcher({
  view,
  onChange,
}: {
  view: AppointmentView;
  onChange: (v: AppointmentView) => void;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-border bg-surface">
      {OPTIONS.map(({ value, icon: Icon, label }, i) => (
        <button
          key={value}
          type="button"
          aria-pressed={view === value}
          onClick={() => onChange(value)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
            i > 0 && "border-l border-border",
            view === value
              ? "bg-brand/10 text-brand"
              : "text-fg-secondary hover:bg-surface-subtle hover:text-fg",
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
