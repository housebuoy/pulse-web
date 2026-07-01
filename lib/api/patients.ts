// Swap point. USE_MOCK true → resolves from lib/mock/patients.
// Flip the flag and the same functions hit Spring Boot. Hooks/components don't move.

import { api } from "@/lib/axios"; // ⚠️ match your lib/api/queue.ts import exactly
import * as mock from "@/lib/mock/patients";
import type {
  CreatePatientInput,
  Patient,
  RecordVitalsInput,
  UpdateClinicalRecordInput,
  UpdatePatientInput,
} from "@/lib/types/patients";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export async function fetchPatients(): Promise<Patient[]> {
  if (USE_MOCK) return mock.listPatients();
  const { data } = await api.get<Patient[]>("/patients");
  return data;
}

export async function fetchPatient(id: string): Promise<Patient> {
  if (USE_MOCK) return mock.getPatient(id);
  const { data } = await api.get<Patient>(`/patients/${id}`);
  return data;
}

export async function createPatient(
  input: CreatePatientInput
): Promise<Patient> {
  if (USE_MOCK) return mock.createPatient(input);
  const { data } = await api.post<Patient>("/patients", input);
  return data;
}

export async function updatePatient(
  input: UpdatePatientInput
): Promise<Patient> {
  if (USE_MOCK) return mock.applyUpdate(input);
  const { id, ...body } = input;
  const { data } = await api.patch<Patient>(`/patients/${id}`, body);
  return data;
}

export async function updateClinicalRecord(
  input: UpdateClinicalRecordInput
): Promise<Patient> {
  if (USE_MOCK) return mock.applyClinicalRecordUpdate(input);
  const { id, ...body } = input;
  const { data } = await api.patch<Patient>(
    `/patients/${id}/clinical-record`,
    body
  );
  return data;
}

export async function recordVitals(
  input: RecordVitalsInput
): Promise<Patient> {
  if (USE_MOCK) return mock.applyVitals(input);
  const { data } = await api.post<Patient>(
    `/patients/${input.id}/vitals`,
    input.vitals
  );
  return data;
}
