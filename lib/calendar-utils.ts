import { toDateKey } from "@/lib/appointment-utils";

/** Monday of the ISO week that contains `dateStr`. */
export function getWeekStart(dateStr: string): Date {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay(); // 0 = Sun
  const toMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + toMonday);
  return d;
}

/** All 7 date keys (Mon → Sun) of the week containing `dateStr`. */
export function getWeekDates(dateStr: string): string[] {
  const monday = getWeekStart(dateStr);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toDateKey(d);
  });
}

/** { from, to } inclusive date keys for the week. */
export function getWeekRange(dateStr: string): { from: string; to: string } {
  const dates = getWeekDates(dateStr);
  return { from: dates[0], to: dates[6] };
}

/** { from, to } for the whole calendar month containing `dateStr`. */
export function getMonthRange(dateStr: string): { from: string; to: string } {
  const d = new Date(`${dateStr}T00:00:00`);
  const year = d.getFullYear();
  const month = d.getMonth();
  const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const to = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

/**
 * 42 Date objects filling a 6-week grid starting from the Monday on or before
 * the 1st of the month that contains `dateStr`.
 */
export function getMonthCalendarDates(dateStr: string): Date[] {
  const d = new Date(`${dateStr}T00:00:00`);
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstDay = new Date(year, month, 1);
  const day = firstDay.getDay(); // 0 = Sun
  const startOffset = day === 0 ? -6 : 1 - day;

  const calStart = new Date(firstDay);
  calStart.setDate(calStart.getDate() + startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const cell = new Date(calStart);
    cell.setDate(calStart.getDate() + i);
    return cell;
  });
}

/** "Jun 30 – Jul 6, 2026" */
export function formatWeekRange(dateStr: string): string {
  const dates = getWeekDates(dateStr);
  const from = new Date(`${dates[0]}T00:00:00`);
  const to = new Date(`${dates[6]}T00:00:00`);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(from)} – ${fmt(to)}, ${to.getFullYear()}`;
}

/** "July 2026" */
export function formatMonthYear(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
