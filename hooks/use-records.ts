import { useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as recordsApi from "@/lib/api/records";
import { useWorkspaceSession } from "@/hooks/use-workspace-session";
import type {
  CreateVisitRecordInput,
  PrescriptionDraft,
  PrescriptionRecord,
  RecordAuthor,
  VisitRecord,
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

export interface SaveConsultationInput extends CreateVisitRecordInput {
  /** Prescriptions written during this consultation. May be empty. */
  prescriptions: PrescriptionDraft[];
}

export interface SaveConsultationResult {
  record: VisitRecord;
  prescriptions: PrescriptionRecord[];
}

/** Thrown when the visit record saved but its prescriptions did not. The
 *  consultation is on file; only the prescriptions need re-entering, and the
 *  UI has to say so rather than implying nothing was saved. */
export class PrescriptionsFailedError extends Error {
  constructor(readonly cause: unknown) {
    super("Prescriptions could not be saved.");
    this.name = "PrescriptionsFailedError";
  }
}

/**
 * Author a consultation record and any prescriptions written during it.
 * Backend-pending (psam-717) — resolves from the mock today, see
 * lib/api/records.ts.
 *
 * Two endpoints, called in order: the prescriptions need the visit record's
 * id to attach to. There is no transaction across them — if the second call
 * fails the visit record still exists, which is why that case gets its own
 * error type instead of being reported as a blanket failure.
 *
 * A retry after that partial failure re-sends only the prescriptions, against
 * the record already on file. Without that, saving again would file a second
 * copy of the same consultation — and records here are append-only, so there
 * would be no way to take the duplicate back. Call `startOver()` when the
 * form is opened for a new consultation to drop that carried-over record.
 */
export function useSaveConsultation() {
  const queryClient = useQueryClient();
  const author = useRecordAuthor();
  // The visit record from an attempt that saved the visit but failed on its
  // prescriptions. Held so the next attempt attaches to it instead of
  // creating a duplicate.
  const partialRecord = useRef<VisitRecord | null>(null);

  const mutation = useMutation<
    SaveConsultationResult,
    unknown,
    SaveConsultationInput
  >({
    mutationFn: async ({ prescriptions, ...visitInput }) => {
      const record =
        partialRecord.current ??
        (await recordsApi.createVisitRecord(visitInput, author));
      partialRecord.current = record;

      if (prescriptions.length > 0) {
        try {
          const saved = await recordsApi.createPrescriptions(
            {
              patientId: record.patientId,
              visitRecordId: record.id,
              prescriptions,
            },
            author,
          );
          partialRecord.current = null;
          return { record, prescriptions: saved };
        } catch (err) {
          throw new PrescriptionsFailedError(err);
        }
      }

      partialRecord.current = null;
      return { record, prescriptions: [] };
    },
    onSettled: (_result, _err, variables) => {
      // Settled, not success: a PrescriptionsFailedError still wrote the
      // visit record, so the history has to refetch either way.
      queryClient.invalidateQueries({
        queryKey: keys.patient(variables.patientId),
      });
    },
  });

  const { reset } = mutation;
  const startOver = useCallback(() => {
    partialRecord.current = null;
    reset();
  }, [reset]);

  return { ...mutation, startOver };
}
