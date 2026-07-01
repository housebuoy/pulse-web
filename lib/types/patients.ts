// Backend contract for patients. Spring Boot serializes to these shapes.
//
// Record-keeping only. This module (and everything built on it) captures and
// displays clinical data — it must never interpret it. No abnormal-vital
// flagging, no drug-interaction/allergy warnings, no triage or dosage
// suggestions, no risk scoring. That keeps Pulse out of medical-device
// classification.

export type Gender = "female" | "male" | "other";

export type VisitStatus = "checked_in" | "waiting" | "in_consultation";

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
}

export interface Vitals {
  bloodPressure: string; // "120/80"
  temperature: string; // "37.0°C"
  pulse: string; // "72 bpm"
  weight: string; // "68 kg"
  recordedAt: string; // ISO datetime
}

export interface CurrentVisit {
  status: VisitStatus;
  departmentId: string;
  departmentName: string;
  since: string; // ISO datetime
  appointmentId?: string;
}

export interface Patient {
  id: string;
  patientNumber: string; // "PT-00123"
  name: string;
  dateOfBirth: string; // "YYYY-MM-DD"
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  registeredAt: string; // ISO datetime

  // Clinical record — record-keeping only, see module note above.
  bloodType?: string;
  allergies: string[];
  currentMedications: Medication[];
  latestVitals?: Vitals;

  currentVisit?: CurrentVisit;
}

export interface CreatePatientInput {
  name: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  bloodType?: string;
}

// The editable fields shared by the add and edit forms.
export type PatientFormValues = CreatePatientInput;

export interface UpdatePatientInput {
  id: string;
  name?: string;
  dateOfBirth?: string;
  gender?: Gender;
  phone?: string;
  email?: string;
  address?: string;
  bloodType?: string;
}

export interface UpdateClinicalRecordInput {
  id: string;
  allergies?: string[];
  currentMedications?: Medication[];
}

export interface RecordVitalsInput {
  id: string;
  vitals: Omit<Vitals, "recordedAt">;
}
