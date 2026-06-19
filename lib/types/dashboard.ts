// Domain models for the admin dashboard.
// These describe the shape the backend WILL return — keep them in sync with
// the API contract so the UI never has to change when you swap mock -> real.

export type TrendDirection = "up" | "down";

/** Drives the colour of the trend pill. Decoupled from direction so an
 *  "up" can be good (appointments) or bad (queue size) per metric. */
export type Sentiment = "positive" | "negative" | "neutral";

export interface StatTrend {
  direction: TrendDirection;
  label: string; // e.g. "12%", "2m", "5", "0.8%"
  sentiment: Sentiment;
}

export interface StatMetric {
  id: string;
  label: string; // "Patients in Queue"
  value: string; // "24", "18", "4.2"  (string so formatting lives server-side)
  unit?: string; // "min", "%"
  trend: StatTrend;
}

export type QueueSeverity = "ok" | "warning" | "critical";

export interface DepartmentQueue {
  id: string;
  department: string;
  statusLabel: string; // "Serving #A-014", "Triage Active"
  waiting: number;
  maxWaitMinutes: number;
  severity: QueueSeverity; // drives the status dot + max-wait emphasis
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface DashboardAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
}

export interface VolumePoint {
  hour: string; // "8 AM"
  walkIns: number;
  appointments: number;
}

export interface FacilitySummary {
  id: string;
  name: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  role: string;
}