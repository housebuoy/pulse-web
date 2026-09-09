import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as appointmentsApi from "@/lib/api/appointments";
import type {
  AppointmentFilters,
  UpdateAppointmentInput,
  UpdatePaymentInput,
} from "@/lib/types/appointments";

// Query-key namespace. Exported so cross-cutting mutations (e.g. queue
// completion, which marks linked bookings done) can invalidate the whole
// appointments family — lists, ranges and stats alike.
export const appointmentKeys = {
  all: ["appointments"] as const,
  list: (filters: AppointmentFilters) =>
    [...appointmentKeys.all, "list", filters] as const,
  stats: (date: string) => [...appointmentKeys.all, "stats", date] as const,
  departments: () => [...appointmentKeys.all, "departments"] as const,
};

export function useAppointments(filters: AppointmentFilters) {
  return useQuery({
    queryKey: appointmentKeys.list(filters),
    queryFn: () => appointmentsApi.fetchAppointments(filters),
    // Fast refresh — external payment/status changes surface within ~5s.
    refetchInterval: 5_000,
    // Keep the old day's rows on screen while a new day loads (v5 keepPreviousData).
    placeholderData: (prev) => prev,
  });
}

export function useAppointmentStats(date: string) {
  return useQuery({
    queryKey: appointmentKeys.stats(date),
    queryFn: () => appointmentsApi.fetchAppointmentStats(date),
    refetchInterval: 5_000,
    placeholderData: (prev) => prev,
  });
}

export function useAppointmentDepartments() {
  return useQuery({
    queryKey: appointmentKeys.departments(),
    queryFn: () => appointmentsApi.fetchAppointmentDepartments(),
    staleTime: 5 * 60_000,
  });
}

export interface RangeOptions {
  staffId?: string;
  enabled?: boolean;
}

export function useAppointmentsRange(
  from: string,
  to: string,
  optionsOrEnabled: RangeOptions | boolean = true,
) {
  const { staffId, enabled } =
    typeof optionsOrEnabled === "object"
      ? optionsOrEnabled
      : { enabled: optionsOrEnabled };
  return useQuery({
    queryKey: [...appointmentKeys.all, "range", from, to, staffId ?? null] as const,
    queryFn: () => appointmentsApi.fetchAppointmentsRange(from, to, staffId),
    // Fast refresh: external events (patient pays via Aza, walk-in check-in)
    // must surface within ~5s — psam hand-tests with the page open and found
    // 30s too slow.
    refetchInterval: 5_000,
    placeholderData: (prev) => prev,
    enabled,
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAppointmentInput) =>
      appointmentsApi.updateAppointment(input),
    onSuccess: () => {
      // One status change touches both the list and the stat counts.
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePaymentInput) =>
      appointmentsApi.updatePayment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}