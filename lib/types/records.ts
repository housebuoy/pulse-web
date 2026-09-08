// Clinical record history — mirrors MedicalRecordsResponse from the backend
// (GET /api/patients/{id}/records, same shapes the patient mobile app reads).

export interface VisitRecord {
  id: string;
  department: string;
  hospital: string;
  date: string; // YYYY-MM-DD
  doctor: string;
  summary: string;
}

export interface LabValue {
  name: string | null;
  value: string | null;
  unit: string | null;
  referenceRange: string | null;
}

export interface LabResult {
  id: string;
  testName: string;
  hospital: string;
  orderingDoctor: string;
  date: string;
  values: LabValue[];
}

export interface PrescriptionRecord {
  id: string;
  medication: string;
  dose: string;
  prescribingDoctor: string;
  hospital: string;
  date: string; // YYYY-MM-DD
}

export interface PatientRecords {
  visits: VisitRecord[];
  labResults: LabResult[];
  prescriptions: PrescriptionRecord[];
}

export interface AddVisitNoteInput {
  patientId: string;
  summary: string;
  visitDate?: string; // YYYY-MM-DD; backend defaults to today
}

export interface AddPrescriptionInput {
  patientId: string;
  medication: string;
  dose: string;
  prescribedDate?: string; // YYYY-MM-DD; backend defaults to today
}
