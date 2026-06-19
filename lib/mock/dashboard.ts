// Dummy data for the dashboard. This is the ONLY file you edit to tweak
// the demo numbers. When the backend is live, the api layer stops importing
// from here — you don't delete anything, you just flip NEXT_PUBLIC_USE_MOCK.

import type {
  StatMetric,
  DepartmentQueue,
  DashboardAlert,
  VolumePoint,
  FacilitySummary,
  CurrentUser,
} from "@/lib/types/dashboard";

/** Simulates network latency so loading states are exercised in dev. */
export const delay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mockStats: StatMetric[] = [
  {
    id: "patients-in-queue",
    label: "Patients in Queue",
    value: "24",
    // a growing queue is congestion -> red. Flip to "neutral" if you'd
    // rather treat volume as purely informational.
    trend: { direction: "up", label: "12%", sentiment: "negative" },
  },
  {
    id: "avg-wait-time",
    label: "Avg Wait Time",
    value: "18",
    unit: "min",
    trend: { direction: "down", label: "2m", sentiment: "positive" },
  },
  {
    id: "appointments-today",
    label: "Appointments Today",
    value: "86",
    trend: { direction: "up", label: "5", sentiment: "positive" },
  },
  {
    id: "no-show-rate",
    label: "No-show Rate",
    value: "4.2",
    unit: "%",
    trend: { direction: "down", label: "0.8%", sentiment: "positive" },
  },
];

export const mockQueue: DepartmentQueue[] = [
  {
    id: "cardiology",
    department: "Cardiology",
    statusLabel: "Serving #A-014",
    waiting: 5,
    maxWaitMinutes: 22,
    severity: "ok",
  },
  {
    id: "pediatrics",
    department: "Pediatrics",
    statusLabel: "Serving #P-042",
    waiting: 12,
    maxWaitMinutes: 35,
    severity: "warning",
  },
  {
    id: "emergency",
    department: "Emergency",
    statusLabel: "Triage Active",
    waiting: 8,
    maxWaitMinutes: 45,
    severity: "critical",
  },
  {
    id: "general-medicine",
    department: "General Medicine",
    statusLabel: "Serving #G-102",
    waiting: 2,
    maxWaitMinutes: 10,
    severity: "ok",
  },
];

export const mockAlerts: DashboardAlert[] = [
  {
    id: "alert-capacity",
    severity: "critical",
    title: "Cardiology over capacity",
    description: "Wait times exceeding 30m",
  },
  {
    id: "alert-hefra",
    severity: "warning",
    title: "HeFRA verification pending",
    description: "Requires admin review",
  },
  {
    id: "alert-unconfirmed",
    severity: "info",
    title: "3 appointments unconfirmed",
    description: "For tomorrow morning",
  },
];

export const mockVolume: VolumePoint[] = [
  { hour: "8 AM", walkIns: 7, appointments: 14 },
  { hour: "10 AM", walkIns: 14, appointments: 20 },
  { hour: "12 PM", walkIns: 18, appointments: 24 },
  { hour: "2 PM", walkIns: 11, appointments: 18 },
  { hour: "4 PM", walkIns: 5, appointments: 11 },
  { hour: "6 PM", walkIns: 3, appointments: 7 },
];

export const mockFacility: FacilitySummary = {
  id: "knust-hospital",
  name: "KNUST University Hospital",
};

export const mockUser: CurrentUser = {
  id: "user-admin",
  name: "Dr. Sarah Jenkins",
  role: "Administrator",
};