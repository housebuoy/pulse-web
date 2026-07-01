import type {
  Appointment,
  AppointmentStatus,
} from "@/lib/types/appointments";
import type { BadgeTone } from "@/components/dashboard/status-badge";

export const STATUS_META: Record<
  AppointmentStatus,
  { label: string; tone: BadgeTone }
> = {
  scheduled: { label: "Scheduled", tone: "neutral" },
  confirmed: { label: "Confirmed", tone: "brand" },
  checked_in: { label: "Checked in", tone: "success" },
  completed: { label: "Completed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
  no_show: { label: "No-show", tone: "warning" },
};

// Each action resolves to the status it transitions the appointment into,
// plus how its button should render. Drives the row's action buttons.
export type AppointmentAction = {
  key: string;
  label: string;
  next: AppointmentStatus;
  variant: "default" | "outline" | "ghost";
};

export function actionsFor(status: AppointmentStatus): AppointmentAction[] {
  switch (status) {
    case "scheduled":
      return [
        { key: "confirm", label: "Confirm", next: "confirmed", variant: "default" },
        { key: "cancel", label: "Cancel", next: "cancelled", variant: "ghost" },
      ];
    case "confirmed":
      return [
        { key: "check_in", label: "Check in", next: "checked_in", variant: "default" },
        { key: "no_show", label: "No-show", next: "no_show", variant: "outline" },
      ];
    case "checked_in":
      // Hand-off to Live Queue happens here; desk can only undo on this screen.
      return [
        { key: "undo", label: "Undo", next: "confirmed", variant: "ghost" },
      ];
    default:
      return []; // completed / cancelled / no_show are terminal here
  }
}

// ---- date / time helpers (local time; Accra is UTC+0 so no drift) ----

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(dateKey: string, delta: number): string {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + delta);
  return toDateKey(d);
}

export function isToday(dateKey: string): boolean {
  return dateKey === toDateKey(new Date());
}

// formatLongDate / formatTime moved to lib/format.ts (shared, locale-pinned).

export function countByDepartment(
  appts: Appointment[]
): Record<string, number> {
  return appts.reduce<Record<string, number>>((acc, a) => {
    acc[a.departmentId] = (acc[a.departmentId] ?? 0) + 1;
    return acc;
  }, {});
}