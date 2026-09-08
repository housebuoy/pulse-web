// Clinical records — the patient's record history (visits, prescriptions, lab
// results) as it already exists on the patient-side mobile app's Records tab.
// These are the *staff-scoped* shapes: the same data the patient reads via
// GET /api/patients/me/records, read here for the patient in front of the doctor.
//
// SCOPE CONSTRAINT (extends the "capture and show, never advise" line in
// lib/types/patients.ts to authoring):
// Pulse FAITHFULLY RECORDS clinician-authored content. It never contributes
// clinical judgement of its own. Concretely, nothing built on these types may
// suggest a diagnosis, autocomplete or cross-check a medication, validate a
// dose against any norm, flag a lab value as out of range, or advise on a
// plan. Every clinical field below is free text the clinician wrote; the app's
// only job is to store it verbatim and show it back unchanged. "Structured"
// here means the input is *organized* — it does not mean the app is smart.

/** Who authored a record. Doctors author visits + prescriptions; lab results
 *  arrive from the laboratory and are read-only everywhere in /w. */
export type RecordAuthorRole = "doctor" | "lab";

/** Author + time stamped onto every record at write time. Server-assigned —
 *  the client never sends these. */
export interface RecordAuthor {
  staffId: string;
  name: string;
  role: RecordAuthorRole;
}

/** The visit a record was authored against. The frontend has no stable visit
 *  id today (Patient.currentVisit carries no id — see BACKEND_SPEC §10.3), so
 *  this captures the visit by department + start time until the backend owns
 *  a real Visit entity. */
export interface VisitContext {
  visitId?: string;
  departmentId: string;
  departmentName: string;
  /** ISO — when the patient's visit started (Patient.currentVisit.since). */
  startedAt?: string;
}

/** One consultation, as the doctor wrote it. Every clinical field is free
 *  text — in particular `diagnosis` is typed, never picked from a suggesting
 *  list. */
export interface VisitRecord {
  id: string;
  patientId: string;
  visit: VisitContext;
  author: RecordAuthor;
  /** ISO — when the record was saved. Server-assigned. */
  recordedAt: string;

  presentingComplaint: string;
  examination: string;
  diagnosis: string;
  plan: string;
  summary: string;
}

/** One prescribed medication, exactly as the doctor typed it. No name
 *  autocomplete, no interaction checking, no dose validation — see the scope
 *  constraint at the top of this file. */
export interface PrescriptionRecord {
  id: string;
  patientId: string;
  /** The consultation this was written during. */
  visitRecordId: string;
  author: RecordAuthor;
  /** ISO — server-assigned. */
  prescribedAt: string;

  medication: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

/** One line of a lab report, recorded verbatim as the laboratory issued it.
 *  `referenceRange` is the lab's own printed range — it is displayed as part
 *  of their report and is never compared against `value` by this app. */
export interface LabResultValue {
  label: string;
  value: string;
  referenceRange?: string;
}

/** A lab report. Lab-authored, never doctor-authored — read-only in /w. */
export interface LabResultRecord {
  id: string;
  patientId: string;
  /** Set when the report was ordered during a recorded consultation. */
  visitRecordId?: string;
  author: RecordAuthor;
  /** ISO — when the lab reported it. */
  reportedAt: string;

  testName: string;
  specimen?: string;
  values: LabResultValue[];
  /** The laboratory's own note on the report, stored verbatim. */
  notes?: string;
}

/** The whole record history for one patient — mirrors the payload behind the
 *  mobile Records tab (GET /api/patients/me/records), read staff-scoped.
 *  Each list is newest-first and always an array, never null. */
export interface PatientRecords {
  visits: VisitRecord[];
  prescriptions: PrescriptionRecord[];
  labResults: LabResultRecord[];
}
