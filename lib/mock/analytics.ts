import { addDays, toDateKey } from "@/lib/analytics-utils";
import type {
  AnalyticsQuery,
  AnalyticsTotals,
  AppointmentStatusBreakdown,
  DailyMetric,
  DepartmentAnalytics,
  FacilityAnalytics,
} from "@/lib/types/analytics";

const SERIES_DAYS = 90;

// Mirrors the department ids/names in lib/mock/departments.ts so the
// department selector (sourced from the live departments list) lines up with
// this dataset. Kept independent rather than imported — these two mocks are
// separately swappable, and analytics shouldn't break if the departments
// seed changes shape.
const DEPARTMENTS: {
  id: string;
  name: string;
  baseVolume: number;
  baseWaitMinutes: number;
  capacityPerDay: number;
}[] = [
  { id: "cardiology", name: "Cardiology", baseVolume: 9, baseWaitMinutes: 22, capacityPerDay: 14 },
  { id: "pediatrics", name: "Pediatrics", baseVolume: 7, baseWaitMinutes: 15, capacityPerDay: 10 },
  { id: "emergency", name: "Emergency", baseVolume: 15, baseWaitMinutes: 9, capacityPerDay: 22 },
  { id: "general-medicine", name: "General Medicine", baseVolume: 11, baseWaitMinutes: 17, capacityPerDay: 18 },
  { id: "maternity", name: "Maternity", baseVolume: 6, baseWaitMinutes: 13, capacityPerDay: 10 },
  { id: "laboratory", name: "Laboratory", baseVolume: 4, baseWaitMinutes: 11, capacityPerDay: 8 },
];

// Deterministic PRNG so the 90-day series is stable across reloads instead of
// reshuffling (and breaking period-over-period deltas) on every page visit.
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface DepartmentDay extends DailyMetric {
  departmentId: string;
}

function generateSeries(): DepartmentDay[] {
  const random = mulberry32(20260101);
  const today = toDateKey(new Date());
  const start = addDays(today, -(SERIES_DAYS - 1));

  const rows: DepartmentDay[] = [];

  for (let i = 0; i < SERIES_DAYS; i++) {
    const date = addDays(start, i);
    const dow = new Date(`${date}T00:00:00`).getDay(); // 0 Sun .. 6 Sat
    const weekendFactor = dow === 0 || dow === 6 ? 0.6 : 1;
    // Gentle upward drift across the window so trend charts aren't flat.
    const trendFactor = 0.9 + (i / SERIES_DAYS) * 0.25;

    for (const dept of DEPARTMENTS) {
      const noise = 0.8 + random() * 0.4;
      const volume = Math.max(
        0,
        Math.round(dept.baseVolume * weekendFactor * trendFactor * noise),
      );
      const appointments = Math.round(volume * (0.55 + random() * 0.1));
      const walkIns = Math.max(0, volume - appointments);

      const waitNoise = 0.75 + random() * 0.5;
      const avgWaitMinutes = Math.round(dept.baseWaitMinutes * waitNoise);
      const p90WaitMinutes = Math.round(avgWaitMinutes * (1.5 + random() * 0.3));

      const noShowRateBase = 0.05 + random() * 0.08;
      const noShows = Math.round(appointments * noShowRateBase);
      const served = Math.max(0, volume - noShows);
      const noShowRate = appointments === 0 ? 0 : (noShows / appointments) * 100;

      rows.push({
        date,
        departmentId: dept.id,
        appointments,
        walkIns,
        patientVolume: volume,
        avgWaitMinutes,
        p90WaitMinutes,
        served,
        noShows,
        noShowRate,
      });
    }
  }

  return rows;
}

// Generated once at module load. Every query below aggregates/filters this
// fixed series server-side (mock-side) and hands back only the result — the
// raw 90-day array never reaches a component.
const series: DepartmentDay[] = generateSeries();

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function inRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : sum(values) / values.length;
}

function aggregateDaily(
  rows: DepartmentDay[],
  from: string,
  to: string,
): DailyMetric[] {
  const byDate = new Map<string, DepartmentDay[]>();
  for (const row of rows) {
    if (!inRange(row.date, from, to)) continue;
    const bucket = byDate.get(row.date) ?? [];
    bucket.push(row);
    byDate.set(row.date, bucket);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayRows]) => {
      const appointments = sum(dayRows.map((r) => r.appointments));
      const walkIns = sum(dayRows.map((r) => r.walkIns));
      const served = sum(dayRows.map((r) => r.served));
      const noShows = sum(dayRows.map((r) => r.noShows));
      return {
        date,
        appointments,
        walkIns,
        patientVolume: appointments + walkIns,
        avgWaitMinutes: Math.round(average(dayRows.map((r) => r.avgWaitMinutes))),
        p90WaitMinutes: Math.round(average(dayRows.map((r) => r.p90WaitMinutes))),
        served,
        noShows,
        noShowRate: appointments === 0 ? 0 : (noShows / appointments) * 100,
      };
    });
}

function summarize(daily: DailyMetric[]): AnalyticsTotals {
  const totalAppointments = sum(daily.map((d) => d.appointments));
  const totalNoShows = sum(daily.map((d) => d.noShows));
  return {
    patientVolume: sum(daily.map((d) => d.patientVolume)),
    avgWaitMinutes: Math.round(average(daily.map((d) => d.avgWaitMinutes))),
    p90WaitMinutes: Math.round(average(daily.map((d) => d.p90WaitMinutes))),
    served: sum(daily.map((d) => d.served)),
    noShowRate: totalAppointments === 0 ? 0 : (totalNoShows / totalAppointments) * 100,
  };
}

function previousRange(from: string, to: string): { from: string; to: string } {
  const days =
    Math.round(
      (new Date(`${to}T00:00:00`).getTime() - new Date(`${from}T00:00:00`).getTime()) /
        86_400_000,
    ) + 1;
  return { from: addDays(from, -days), to: addDays(from, -1) };
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

// Modeled rather than pulled from lib/mock/appointments.ts — that slice is
// keyed by a single day, not a 90-day window. Splits the period's total
// appointments across plausible outcome buckets.
function appointmentsByStatus(
  rows: DepartmentDay[],
  from: string,
  to: string,
): AppointmentStatusBreakdown[] {
  const inWindow = rows.filter((r) => inRange(r.date, from, to));
  const totalAppointments = sum(inWindow.map((r) => r.appointments));
  const totalNoShows = sum(inWindow.map((r) => r.noShows));

  const completed = Math.round(totalAppointments * 0.78);
  const cancelled = Math.round(totalAppointments * 0.06);
  const noShow = totalNoShows;
  const remaining = Math.max(0, totalAppointments - completed - cancelled - noShow);
  const confirmed = Math.round(remaining * 0.6);
  const scheduled = Math.max(0, remaining - confirmed);

  return [
    { status: "completed", label: STATUS_LABELS.completed, count: completed },
    { status: "confirmed", label: STATUS_LABELS.confirmed, count: confirmed },
    { status: "scheduled", label: STATUS_LABELS.scheduled, count: scheduled },
    { status: "cancelled", label: STATUS_LABELS.cancelled, count: cancelled },
    { status: "no_show", label: STATUS_LABELS.no_show, count: noShow },
  ];
}

export function queryAnalytics({ from, to }: AnalyticsQuery): Promise<FacilityAnalytics> {
  const daily = aggregateDaily(series, from, to);
  const totals = summarize(daily);

  const prev = previousRange(from, to);
  const previousTotals = summarize(aggregateDaily(series, prev.from, prev.to));

  const departments: DepartmentAnalytics[] = DEPARTMENTS.map((dept) => {
    const deptRows = series.filter((r) => r.departmentId === dept.id);
    const deptDaily = aggregateDaily(deptRows, from, to);
    const deptTotals = summarize(deptDaily);
    const deptPreviousTotals = summarize(aggregateDaily(deptRows, prev.from, prev.to));
    const days = deptDaily.length || 1;
    const utilization = Math.min(
      100,
      Math.round((deptTotals.served / (dept.capacityPerDay * days)) * 100),
    );
    return {
      departmentId: dept.id,
      departmentName: dept.name,
      daily: deptDaily,
      totals: deptTotals,
      previousTotals: deptPreviousTotals,
      capacityPerDay: dept.capacityPerDay,
      utilization,
    };
  });

  return delay({
    range: { from, to },
    daily,
    totals,
    previousTotals,
    appointmentsByStatus: appointmentsByStatus(series, from, to),
    departments,
  });
}
