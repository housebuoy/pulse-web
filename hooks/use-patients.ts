import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as patientsApi from "@/lib/api/patients";
import type {
  CreatePatientInput,
  RecordVitalsInput,
  UpdateClinicalRecordInput,
  UpdatePatientInput,
} from "@/lib/types/patients";

const keys = {
  all: ["patients"] as const,
  list: () => [...keys.all, "list"] as const,
};

export function usePatients() {
  return useQuery({
    queryKey: keys.list(),
    queryFn: () => patientsApi.fetchPatients(),
    // "Currently here" is meant to feel live, same cadence as the live queue.
    refetchInterval: 15_000,
    placeholderData: (prev) => prev,
  });
}

// Derives a single patient from the shared list query instead of firing a
// second request — mirrors useStaffMember in hooks/use-staff.ts.
export function usePatient(id: string | undefined) {
  const query = usePatients();
  const patient = id ? query.data?.find((p) => p.id === id) : undefined;
  return { ...query, data: patient };
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePatientInput) => patientsApi.createPatient(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePatientInput) => patientsApi.updatePatient(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateClinicalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateClinicalRecordInput) =>
      patientsApi.updateClinicalRecord(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useRecordVitals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RecordVitalsInput) => patientsApi.recordVitals(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}
