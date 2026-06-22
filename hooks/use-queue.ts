"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getQueueDepartments,
  getQueueEntries,
  callNextPatient,
  updateQueueEntryStatus,
} from "@/lib/api/queue";

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