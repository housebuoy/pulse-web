// Swap point. USE_MOCK true → resolves from lib/mock/records.
// Flip the flag and the same functions hit Spring Boot. Hooks/components don't move.
//
// The read below is the STAFF-SCOPED counterpart of the patient-side
// GET /api/patients/me/records that already backs the mobile Records tab —
// same data, addressed by patient id and authorized as staff.

import { api } from "@/lib/axios";
import * as mock from "@/lib/mock/records";
import type { PatientRecords } from "@/lib/types/records";

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
