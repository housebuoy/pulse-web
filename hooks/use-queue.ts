"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getQueueDepartments,
  getQueueEntries,
  callNextPatient,
  updateQueueEntryStatus,
  completeQueueEntry,
} from "@/lib/api/queue";
import { appointmentKeys } from "@/hooks/use-appointments";
import type { CompleteConsultInput } from "@/lib/types/queue";

export const queueKeys = {
  all: ["queue"] as const,
  departments: ["queue", "departments"] as const,
  entries: (departmentId: string) =>
    ["queue", "entries", departmentId] as const,
};

export function useQueueDepartments() {
  return useQuery({
    queryKey: queueKeys.departments,
    queryFn: getQueueDepartments,
    refetchInterval: 10_000,
  });
}

export function useQueueEntries(departmentId: string) {
  return useQuery({
    queryKey: queueKeys.entries(departmentId),
    queryFn: () => getQueueEntries(departmentId),
    refetchInterval: 5_000,
  });
}

export function useCallNext() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: callNextPatient,
    onSuccess: () => qc.invalidateQueries({ queryKey: queueKeys.all }),
  });
}

export function useUpdateQueueStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateQueueEntryStatus,
    onSuccess: () => qc.invalidateQueries({ queryKey: queueKeys.all }),
  });
}

export interface CompleteConsultVariables {
  entryId: number | string;
  input: CompleteConsultInput;
}

// Completes a consultation (POST /queue/entries/{id}/complete). The backend
// records the outcome and marks the booking completed, which feeds both the
// queue board and the appointments-derived "Previously handled" list — so
// invalidate both query families on success.
export function useCompleteConsult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, input }: CompleteConsultVariables) =>
      completeQueueEntry(entryId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queueKeys.all });
      qc.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}