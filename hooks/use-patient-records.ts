import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as recordsApi from "@/lib/api/records";
import type {
  AddPrescriptionInput,
  AddVisitNoteInput,
} from "@/lib/types/records";

const keys = {
  all: ["patient-records"] as const,
  patient: (patientId: string) => [...keys.all, patientId] as const,
};

export function usePatientRecords(patientId: string | undefined) {
  return useQuery({
    queryKey: keys.patient(patientId ?? ""),
    queryFn: () => recordsApi.fetchPatientRecords(patientId as string),
    enabled: Boolean(patientId),
  });
}

export function useAddVisitNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddVisitNoteInput) => recordsApi.addVisitNote(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: keys.patient(input.patientId) });
    },
  });
}

export function useAddPrescription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddPrescriptionInput) =>
      recordsApi.addPrescription(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: keys.patient(input.patientId) });
    },
  });
}
