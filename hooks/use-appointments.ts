import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as appointmentsApi from "@/lib/api/appointments";
import type {
  AppointmentFilters,
  UpdateAppointmentInput,
} from "@/lib/types/appointments";

const keys = {
  all: ["appointments"] as const,
  list: (filters: AppointmentFilters) =>
    [...keys.all, "list", filters] as const,
  stats: (date: string) => [...keys.all, "stats", date] as const,
  departments: () => [...keys.all, "departments"] as const,
};

export function useAppointments(filters: AppointmentFilters) {
  return useQuery({
    queryKey: keys.list(filters),
    queryFn: () => appointmentsApi.fetchAppointments(filters),
    // Light polling — the schedule isn't a live ticker like the queue.
    refetchInterval: 30_000,
    // Keep the old day's rows on screen while a new day loads (v5 keepPreviousData).
    placeholderData: (prev) => prev,
  });
}

export function useAppointmentStats(date: string) {
  return useQuery({
    queryKey: keys.stats(date),
    queryFn: () => appointmentsApi.fetchAppointmentStats(date),
    refetchInterval: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useAppointmentDepartments() {
  return useQuery({
    queryKey: keys.departments(),
    queryFn: () => appointmentsApi.fetchAppointmentDepartments(),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAppointmentInput) =>
      appointmentsApi.updateAppointment(input),
    onSuccess: () => {
      // One status change touches both the list and the stat counts.
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}