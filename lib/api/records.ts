// Swap point. USE_MOCK true → resolves from lib/mock/records.
// Flip the flag and the same functions hit Spring Boot. Hooks/components don't move.
//
// The read below is the STAFF-SCOPED counterpart of the patient-side
// GET /api/patients/me/records that already backs the mobile Records tab —
// same data, addressed by patient id and authorized as staff.

import { api } from "@/lib/axios";
import * as mock from "@/lib/mock/records";
import type {
  CreateVisitRecordInput,
  PatientRecords,
  RecordAuthor,
  VisitRecord,
} from "@/lib/types/records";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export async function fetchPatientRecords(
  patientId: string
): Promise<PatientRecords> {
  if (USE_MOCK) return mock.listPatientRecords(patientId);
  const { data } = await api.get<PatientRecords>(
    `/patients/${patientId}/records`
  );
  return data;
}

/**
 * Author a consultation record. Staff-side WRITE counterpart of the
 * patient-side read above — BACKEND-PENDING (psam-717): the real route
 * POST /patients/{id}/visits does not exist yet, so this resolves from the
 * mock today and needs no component change when it lands.
 *
 * `author` is passed only so the mock can stamp what the real server stamps
 * from the caller's JWT. It is deliberately NOT part of the request body.
 */
export async function createVisitRecord(
  input: CreateVisitRecordInput,
  author: RecordAuthor
): Promise<VisitRecord> {
  if (USE_MOCK) return mock.createVisitRecord(input, author);
  const { patientId, ...body } = input;
  const { data } = await api.post<VisitRecord>(
    `/patients/${patientId}/visits`,
    body
  );
  return data;
}
