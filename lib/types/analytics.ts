// Backend contract for analytics. Spring Boot serializes to exactly these
// shapes — all aggregation (daily rollups, totals, period-over-period,
// utilization) happens server-side. The UI only ever renders what it's given.
//
// Descriptive only: counts, averages, trends. No forecasting, no anomaly
// flagging, no recommended actions, no risk scoring.

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD, inclusive
}

export interface DailyMetric {
  date: string; // YYYY-MM-DD
  appointments: number;
  walkIns: number;
  patientVolume: number; // appointments + walkIns
  avgWaitMinutes: number;
  p90WaitMinutes: number;
  served: number; // queue throughput
  noShows: number;
  noShowRate: number; // 0-100
}

export interface AppointmentStatusBreakdown {
  status: string;
  label: string;
  count: number;
}

export interface AnalyticsTotals {
  patientVolume: number;
  avgWaitMinutes: number;
  p90WaitMinutes: number;
  served: number;
  noShowRate: number;
}

export interface DepartmentAnalytics {
  departmentId: string;
  departmentName: string;
  daily: DailyMetric[];
  totals: AnalyticsTotals;
  previousTotals: AnalyticsTotals;
  capacityPerDay: number;
  utilization: number; // 0-100, served vs capacity over the range
}

export interface FacilityAnalytics {
  range: DateRange;
  daily: DailyMetric[];
  totals: AnalyticsTotals;
  previousTotals: AnalyticsTotals;
  appointmentsByStatus: AppointmentStatusBreakdown[];
  departments: DepartmentAnalytics[];
}

export interface AnalyticsQuery {
  from: string;
  to: string;
}
