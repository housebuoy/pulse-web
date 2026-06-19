"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getDepartmentQueue,
  getDashboardAlerts,
  getPatientVolume,
  getCurrentFacility,
  getCurrentUser,
} from "@/lib/api/dashboard";

// Centralised query keys — keeps cache invalidation predictable.
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: ["dashboard", "stats"] as const,
  queue: ["dashboard", "queue"] as const,
  alerts: ["dashboard", "alerts"] as const,
  volume: ["dashboard", "volume"] as const,
  facility: ["dashboard", "facility"] as const,
  user: ["dashboard", "user"] as const,
};

export function useDashboardStats() {
  return useQuery({ queryKey: dashboardKeys.stats, queryFn: getDashboardStats });
}

// The live queue is the one thing that should poll. refetchInterval makes it
// "live" with zero extra wiring; works identically against the real endpoint.
export function useDepartmentQueue() {
  return useQuery({
    queryKey: dashboardKeys.queue,
    queryFn: getDepartmentQueue,
    refetchInterval: 10_000,
  });
}

export function useDashboardAlerts() {
  return useQuery({ queryKey: dashboardKeys.alerts, queryFn: getDashboardAlerts });
}

export function usePatientVolume() {
  return useQuery({ queryKey: dashboardKeys.volume, queryFn: getPatientVolume });
}

export function useCurrentFacility() {
  return useQuery({ queryKey: dashboardKeys.facility, queryFn: getCurrentFacility });
}

export function useCurrentUser() {
  return useQuery({ queryKey: dashboardKeys.user, queryFn: getCurrentUser });
}