import { useQuery } from "@tanstack/react-query";
import * as recordsApi from "@/lib/api/records";

const keys = {
  all: ["records"] as const,
  patient: (patientId: string) => [...keys.all, "patient", patientId] as const,
};

export { keys as recordKeys };

/** Read-only record history for one patient — past visits, prescriptions and
 *  lab results. Not polled: records change only when someone authors one, and
 *  authoring invalidates this key. */
export function usePatientRecords(patientId: string | undefined) {
  return useQuery({
    queryKey: keys.patient(patientId ?? ""),
    queryFn: () => recordsApi.fetchPatientRecords(patientId as string),
    enabled: !!patientId,
  });
}
