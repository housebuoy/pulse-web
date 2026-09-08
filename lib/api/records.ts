// Clinical record API — staff-side access + authoring (backend issue #41).
// Mock mode returns empty history and echoes a minimal created record so the
// UI is navigable without a backend; real mode hits /api/patients/{id}/records.

import { api } from "@/lib/axios";
import type {
  AddPrescriptionInput,
  AddVisitNoteInput,
  PatientRecords,
  PrescriptionRecord,
  VisitRecord,
} from "@/lib/types/records";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export async function fetchPatientRecords(
  patientId: string,
): Promise<PatientRecords> {
  if (USE_MOCK) return { visits: [], labResults: [], prescriptions: [] };
  const { data } = await api.get<PatientRecords>(`/patients/${patientId}/records`);
  return data;
}

export async function addVisitNote(
  input: AddVisitNoteInput,
): Promise<VisitRecord> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return {
      id: `mock-visit-${Date.now()}`,
      department: "Cardiology",
      hospital: "Demo Hospital",
      date: input.visitDate ?? new Date().toISOString().slice(0, 10),
      doctor: "Dr. Demo",
      summary: input.summary,
    };
  }
  const { patientId, ...body } = input;
  const { data } = await api.post<VisitRecord>(
    `/patients/${patientId}/records/visits`,
    body,
  );
  return data;
}

export async function addPrescription(
  input: AddPrescriptionInput,
): Promise<PrescriptionRecord> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return {
      id: `mock-rx-${Date.now()}`,
      medication: input.medication,
      dose: input.dose,
      prescribingDoctor: "Dr. Demo",
      hospital: "Demo Hospital",
      date: input.prescribedDate ?? new Date().toISOString().slice(0, 10),
    };
  }
  const { patientId, ...body } = input;
  const { data } = await api.post<PrescriptionRecord>(
    `/patients/${patientId}/records/prescriptions`,
    body,
  );
  return data;
}
