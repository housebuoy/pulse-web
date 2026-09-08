// In-memory clinical-record store, same shape as every other lib/mock/* module:
// a seeded array mutated for the session only (resets on reload).
//
// Reads mirror the mobile Records tab. Writes are the staff-side counterparts
// that don't exist on the backend yet (psam-717) — they live here so the
// authoring UI can be built and exercised end to end now.
//
// SCOPE: stores exactly what the clinician typed. No normalization of
// medication names, no dose checking, no interpretation of any field.
// See lib/types/records.ts.

import type {
  CreatePrescriptionsInput,
  CreateVisitRecordInput,
  LabResultRecord,
  PatientRecords,
  PrescriptionRecord,
  RecordAuthor,
  VisitRecord,
} from "@/lib/types/records";

function daysAgo(days: number, hour = 10, minute = 30): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const DR_OWUSU = {
  staffId: "staff-owusu",
  name: "Dr. Owusu",
  role: "doctor" as const,
};

const DR_BOATENG = {
  staffId: "staff-boateng",
  name: "Dr. Boateng",
  role: "doctor" as const,
};

const LAB = {
  staffId: "lab-knust-main",
  name: "Main Laboratory",
  role: "lab" as const,
};

const visitSeed: VisitRecord[] = [
  {
    id: "visit-record-001",
    patientId: "patient-kwame-mensah",
    visit: {
      departmentId: "cardiology",
      departmentName: "Cardiology",
      startedAt: daysAgo(96, 9, 40),
    },
    author: DR_OWUSU,
    recordedAt: daysAgo(96, 10, 15),
    presentingComplaint:
      "Follow-up for hypertension. Reports occasional headaches in the mornings.",
    examination:
      "Alert, oriented. BP 142/90 seated, repeat 138/88. Heart sounds S1 S2, no murmur. Chest clear. No peripheral oedema.",
    diagnosis: "Essential hypertension, ongoing.",
    plan: "Continue lisinopril 10mg daily. Reduce added salt. Review in 3 months with a repeat BP log.",
    summary:
      "Routine hypertension follow-up. Medication continued unchanged, review booked for 3 months.",
  },
  {
    id: "visit-record-002",
    patientId: "patient-kwame-mensah",
    visit: {
      departmentId: "general-medicine",
      departmentName: "General Medicine",
      startedAt: daysAgo(28, 14, 5),
    },
    author: DR_BOATENG,
    recordedAt: daysAgo(28, 14, 35),
    presentingComplaint: "Three days of dry cough and sore throat. No fever at home.",
    examination:
      "Temp 37.1°C. Throat mildly injected, no exudate. Chest clear on auscultation. No lymphadenopathy.",
    diagnosis: "Upper respiratory tract infection, viral.",
    plan: "Fluids and rest. Paracetamol as needed for throat pain. Return if fever develops or symptoms persist beyond a week.",
    summary: "Viral URTI. Symptomatic management, no antibiotics given.",
  },
  {
    id: "visit-record-003",
    patientId: "patient-abena-asante",
    visit: {
      departmentId: "general-medicine",
      departmentName: "General Medicine",
      startedAt: daysAgo(45, 11, 0),
    },
    author: DR_OWUSU,
    recordedAt: daysAgo(45, 11, 25),
    presentingComplaint: "Annual check-up. No complaints.",
    examination: "Well. BP 118/74. Pulse 68. Chest and abdomen unremarkable.",
    diagnosis: "No acute illness found on examination.",
    plan: "Routine bloods requested. Next check-up in a year.",
    summary: "Well-person check. Bloods ordered, no medication started.",
  },
];

const prescriptionSeed: PrescriptionRecord[] = [
  {
    id: "prescription-001",
    patientId: "patient-kwame-mensah",
    visitRecordId: "visit-record-001",
    author: DR_OWUSU,
    prescribedAt: daysAgo(96, 10, 15),
    medication: "Lisinopril",
    dose: "10mg",
    frequency: "Once daily",
    duration: "3 months",
    instructions: "Take in the morning, with or without food.",
  },
  {
    id: "prescription-002",
    patientId: "patient-kwame-mensah",
    visitRecordId: "visit-record-002",
    author: DR_BOATENG,
    prescribedAt: daysAgo(28, 14, 35),
    medication: "Paracetamol",
    dose: "1g",
    frequency: "Up to 4 times daily as needed",
    duration: "5 days",
    instructions: "For throat pain. Stop when symptoms settle.",
  },
];

const labResultSeed: LabResultRecord[] = [
  {
    id: "lab-result-001",
    patientId: "patient-kwame-mensah",
    visitRecordId: "visit-record-001",
    author: LAB,
    reportedAt: daysAgo(95, 8, 20),
    testName: "Renal profile",
    specimen: "Serum",
    values: [
      { label: "Sodium", value: "139 mmol/L", referenceRange: "135–145" },
      { label: "Potassium", value: "4.2 mmol/L", referenceRange: "3.5–5.1" },
      { label: "Creatinine", value: "88 µmol/L", referenceRange: "62–106" },
      { label: "Urea", value: "5.1 mmol/L", referenceRange: "2.5–7.1" },
    ],
  },
  {
    id: "lab-result-002",
    patientId: "patient-abena-asante",
    visitRecordId: "visit-record-003",
    author: LAB,
    reportedAt: daysAgo(44, 9, 5),
    testName: "Full blood count",
    specimen: "EDTA whole blood",
    values: [
      { label: "Haemoglobin", value: "12.8 g/dL", referenceRange: "12.0–15.0" },
      { label: "White cell count", value: "6.4 ×10⁹/L", referenceRange: "4.0–11.0" },
      { label: "Platelets", value: "268 ×10⁹/L", referenceRange: "150–400" },
    ],
    notes: "Sample received 08:10. No haemolysis.",
  },
];

let visits: VisitRecord[] = visitSeed.map((v) => ({ ...v }));
let prescriptions: PrescriptionRecord[] = prescriptionSeed.map((p) => ({ ...p }));
let labResults: LabResultRecord[] = labResultSeed.map((l) => ({ ...l }));

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Newest first, matching the order the mobile Records tab renders. */
function byNewest(a: string, b: string): number {
  return new Date(b).getTime() - new Date(a).getTime();
}

export function listPatientRecords(patientId: string): Promise<PatientRecords> {
  return delay({
    visits: visits
      .filter((v) => v.patientId === patientId)
      .sort((a, b) => byNewest(a.recordedAt, b.recordedAt))
      .map((v) => ({ ...v })),
    prescriptions: prescriptions
      .filter((p) => p.patientId === patientId)
      .sort((a, b) => byNewest(a.prescribedAt, b.prescribedAt))
      .map((p) => ({ ...p })),
    labResults: labResults
      .filter((l) => l.patientId === patientId)
      .sort((a, b) => byNewest(a.reportedAt, b.reportedAt))
      .map((l) => ({ ...l })),
  });
}

/**
 * Stands in for POST /patients/{id}/visits (staff-scoped, backend-pending —
 * psam-717). Stores the consultation exactly as typed: no normalization, no
 * validation of clinical content, no derived fields. The author and
 * recordedAt stamp is applied here because the real server applies it — the
 * client never sends either.
 */
export function createVisitRecord(
  input: CreateVisitRecordInput,
  author: RecordAuthor
): Promise<VisitRecord> {
  if (author.role !== "doctor") {
    return Promise.reject(
      new Error("Only a doctor can author a consultation record.")
    );
  }
  const record: VisitRecord = {
    id: crypto.randomUUID(),
    patientId: input.patientId,
    visit: { ...input.visit },
    author,
    recordedAt: new Date().toISOString(),
    presentingComplaint: input.presentingComplaint,
    examination: input.examination,
    diagnosis: input.diagnosis,
    plan: input.plan,
    summary: input.summary,
  };
  visits.push(record);
  return delay({ ...record });
}

/**
 * Stands in for POST /patients/{id}/prescriptions (staff-scoped,
 * backend-pending — psam-717). Writes one record per prescription, each tied
 * to the visit record it was authored in.
 *
 * SCOPE: stores the medication name and regimen strings exactly as typed. No
 * catalog lookup, no interaction or allergy cross-check against the patient,
 * no dose validation. See lib/types/records.ts.
 */
export function createPrescriptions(
  input: CreatePrescriptionsInput,
  author: RecordAuthor
): Promise<PrescriptionRecord[]> {
  if (author.role !== "doctor") {
    return Promise.reject(new Error("Only a doctor can author a prescription."));
  }
  const prescribedAt = new Date().toISOString();
  const created: PrescriptionRecord[] = input.prescriptions.map((p) => ({
    id: crypto.randomUUID(),
    patientId: input.patientId,
    visitRecordId: input.visitRecordId,
    author,
    prescribedAt,
    medication: p.medication,
    dose: p.dose,
    frequency: p.frequency,
    duration: p.duration,
    instructions: p.instructions,
  }));
  prescriptions.push(...created);
  return delay(created.map((p) => ({ ...p })));
}

export function resetRecords(): void {
  visits = visitSeed.map((v) => ({ ...v }));
  prescriptions = prescriptionSeed.map((p) => ({ ...p }));
  labResults = labResultSeed.map((l) => ({ ...l }));
}
