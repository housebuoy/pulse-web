import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as recordsApi from "@/lib/api/records";
import { useWorkspaceSession } from "@/hooks/use-workspace-session";
import type {
  CreateVisitRecordInput,
  RecordAuthor,
} from "@/lib/types/records";

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

/** The signed-in clinician, in the shape a record stamps its author with.
 *  Mirrors what the real backend derives from the JWT — the client sends none
 *  of this, it is passed to the mock so it can stamp the same fields. */
function useRecordAuthor(): RecordAuthor {
  const session = useWorkspaceSession();
  return {
    staffId: session.staffId,
    name: session.name,
    // Non-doctor roles are rejected by the write layer; see canAuthorRecords().
    role: session.role === "doctor" ? "doctor" : "lab",
  };
}

/** True when the signed-in user may author clinical records. Doctors only.
 *  Frontend gate — real enforcement is RBAC on the staff-side write endpoints
 *  (BACKEND_SPEC §8.2), same division as components/auth/require-role.tsx. */
export function useCanAuthorRecords(): boolean {
  const session = useWorkspaceSession();
  return session.role === "doctor";
}

/** Author a consultation record. Backend-pending (psam-717) — resolves from
 *  the mock today, see lib/api/records.ts. */
export function useCreateVisitRecord() {
  const queryClient = useQueryClient();
  const author = useRecordAuthor();
  return useMutation({
    mutationFn: (input: CreateVisitRecordInput) =>
      recordsApi.createVisitRecord(input, author),
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: keys.patient(record.patientId) });
    },
  });
}
