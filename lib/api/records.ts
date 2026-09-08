
export type RecordAuthorRole = "doctor" | "lab";

export interface RecordAuthor {
  staffId: string;
  name: string;
  role: RecordAuthorRole;
}


export interface VisitContext {
  visitId?: string;
  departmentId: string;
  departmentName: string;
  startedAt?: string;
}


export interface VisitRecord {
  id: string;
  patientId: string;
  visit: VisitContext;
  author: RecordAuthor;
  recordedAt: string;

  presentingComplaint: string;
  examination: string;
  diagnosis: string;
  plan: string;
  summary: string;
}

export interface PrescriptionRecord {
  id: string;
  patientId: string;
  visitRecordId: string;
  author: RecordAuthor;
  prescribedAt: string;

  medication: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface LabResultValue {
  label: string;
  value: string;
  referenceRange?: string;
}

export interface LabResultRecord {
  id: string;
  patientId: string;
  visitRecordId?: string;
  author: RecordAuthor;
  reportedAt: string;

  testName: string;
  specimen?: string;
  values: LabResultValue[];
  notes?: string;
}

export interface PatientRecords {
  visits: VisitRecord[];
  prescriptions: PrescriptionRecord[];
  labResults: LabResultRecord[];
}


export interface CreateVisitRecordInput {
  patientId: string;
  visit: VisitContext;

  presentingComplaint: string;
  examination: string;
  diagnosis: string;
  plan: string;
  summary: string;
}


export interface PrescriptionDraft {
  medication: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface CreatePrescriptionsInput {
  patientId: string;
  visitRecordId: string;
  prescriptions: PrescriptionDraft[];
}


export interface AddVisitNoteInput {
  patientId: string;
  summary: string;
  visitDate?: string; 
}

export interface AddPrescriptionInput {
  patientId: string;
  medication: string;
  dose: string;
  prescribedDate?: string; 
}