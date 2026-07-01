import { LOCALE } from "@/lib/format";
import type { StatTrend } from "@/lib/types/dashboard";

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

export function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00`).getTime();
  const b = new Date(`${to}T00:00:00`).getTime();
  return Math.round((b - a) / 86_400_000) + 1; // inclusive
}

export function previousRange(from: string, to: string): { from: string; to: string } {
  const span = daysBetween(from, to);
  return { from: addDays(from, -span), to: addDays(from, -1) };
}

export type RangePreset = "today" | "7d" | "30d" | "90d" | "custom";

export const RANGE_PRESET_LABEL: Record<RangePreset, string> = {
  today: "Today",
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  custom: "Custom",
};

export function presetToRange(
  preset: Exclude<RangePreset, "custom">,
): { from: string; to: string } {
  const today = toDateKey(new Date());
  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "7d":
      return { from: addDays(today, -6), to: today };
    case "30d":
      return { from: addDays(today, -29), to: today };
    case "90d":
      return { from: addDays(today, -89), to: today };
  }
}

// formatRangeLabel moved to lib/format.ts (shared, locale-pinned).

// Compact axis-tick format ("Jun 22", no year) — distinct enough from the
// shared formatters that it stays local to analytics, but still pins LOCALE
// from lib/format.ts rather than re-hardcoding it.
export function formatChartDate(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(LOCALE, {
    month: "short",
    day: "numeric",
  });
}

// Period-over-period change. goodDirection says which way is an improvement
// for this particular metric (e.g. "up" for volume, "down" for wait time) so
// the sentiment colour is correct — purely descriptive, not a judgement call
// beyond "more of this is good/bad".
export function computeDelta(
  current: number,
  previous: number,
  goodDirection: "up" | "down" = "up",
): StatTrend {
  if (previous === 0 && current === 0) {
    return { direction: "up", label: "0%", sentiment: "neutral" };
  }
  if (previous === 0) {
    return {
      direction: "up",
      label: "New",
      sentiment: goodDirection === "up" ? "positive" : "negative",
    };
  }
  const change = ((current - previous) / previous) * 100;
  const direction: "up" | "down" = change >= 0 ? "up" : "down";
  const magnitude = Math.abs(change);
  const label = `${magnitude < 0.1 ? "0" : magnitude.toFixed(1)}%`;
  let sentiment: StatTrend["sentiment"] = "neutral";
  if (magnitude >= 0.1) {
    const isImprovement = (direction === "up") === (goodDirection === "up");
    sentiment = isImprovement ? "positive" : "negative";
  }
  return { direction, label, sentiment };
}

// ---- CSV export — built by hand, no extra dependency ----

export function buildCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
