// ─────────────────────────────────────────────────────────────────────────
// THE SWAP POINT.
// Today these return mock data. When the backend is ready you do TWO things:
//   1. set NEXT_PUBLIC_USE_MOCK="false" in your env
//   2. confirm the endpoint paths + that the JSON matches lib/types/dashboard
// Nothing in components/ or hooks/ changes. That's the whole point.
// ─────────────────────────────────────────────────────────────────────────

import {
  delay,
  mockStats,
  mockQueue,
  mockAlerts,
  mockVolume,
  mockFacility,
  mockUser,
} from "@/lib/mock/dashboard";
import type {
  StatMetric,
  DepartmentQueue,
  DashboardAlert,
  VolumePoint,
  FacilitySummary,
  CurrentUser,
} from "@/lib/types/dashboard";

// Default to mock unless explicitly turned off, so the app runs with zero
// backend out of the box.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

// Lazy import so mock mode never requires your axios instance to exist yet.
// Adjust the path if your configured axios client lives elsewhere
// (e.g. "@/lib/axios" or "@/lib/api/client").
async function client() {
  const mod = await import("@/lib/axios");
  return mod.api ?? mod.default;
}

export async function getDashboardStats(): Promise<StatMetric[]> {
  if (USE_MOCK) {
    await delay();
    return mockStats;
  }
  const api = await client();
  const { data } = await api.get<StatMetric[]>("/dashboard/stats");
  return data;
}

export async function getDepartmentQueue(): Promise<DepartmentQueue[]> {
  if (USE_MOCK) {
    await delay();
    return mockQueue;
  }
  const api = await client();
  const { data } = await api.get<DepartmentQueue[]>("/dashboard/queue");
  return data;
}

export async function getDashboardAlerts(): Promise<DashboardAlert[]> {
  if (USE_MOCK) {
    await delay();
    return mockAlerts;
  }
  const api = await client();
  const { data } = await api.get<DashboardAlert[]>("/dashboard/alerts");
  return data;
}

export async function getPatientVolume(): Promise<VolumePoint[]> {
  if (USE_MOCK) {
    await delay();
    return mockVolume;
  }
  const api = await client();
  const { data } = await api.get<VolumePoint[]>("/dashboard/patient-volume");
  return data;
}

export async function getCurrentFacility(): Promise<FacilitySummary> {
  if (USE_MOCK) {
    await delay(150);
    return mockFacility;
  }
  const api = await client();
  const { data } = await api.get<FacilitySummary>("/facility/current");
  return data;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  if (USE_MOCK) {
    await delay(150);
    return mockUser;
  }
  const api = await client();
  const { data } = await api.get<CurrentUser>("/auth/me");
  return data;
}