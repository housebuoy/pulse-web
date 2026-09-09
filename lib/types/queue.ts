// Domain models for the Live Queue. Keep in sync with the backend contract so
// the UI never changes when mock -> real.

export type QueueStatus =
  | "waiting"
  | "in_consultation"
  | "completed"
  | "no_show"
  | "skipped";

export type QueuePriority = "routine" | "urgent" | "emergency";

export type PatientSource = "walk_in" | "appointment";

export interface QueueEntry {
  id: string;
  ticketNumber: string; // "A-014"
  patientName: string;
  departmentId: string;
  status: QueueStatus;
  priority: QueuePriority;
  source: PatientSource;
  checkInAt: string; // ISO — when they joined the queue
  calledAt?: string | null; // ISO — when moved into consultation
  clinician?: string | null;
  /** Stable staff id of the clinician — the identity join key. Match on this,
   *  never the mutable clinician display name. */
  clinicianId?: string | null;
  room?: string | null;
}

export type DepartmentSeverity = "ok" | "warning" | "critical";

export interface QueueDepartment {
  id: string;
  name: string;
  waiting: number; // count of waiting entries
  nowServing: string | null; // ticket currently in consultation
  longestWaitMinutes: number;
  severity: DepartmentSeverity;
}

// Inputs for the mutating endpoints.
export interface CallNextInput {
  departmentId: string;
  entryId?: string; // omit to call the top of the queue
}

export interface UpdateStatusInput {
  entryId: string;
  status: QueueStatus;
}

// POST /queue/entries/{id}/complete — consultation outcome recorded when a
// doctor finishes with a patient. All fields optional; the backend writes the
// consult record and marks the queue entry (and any linked booking) done.
export interface CompleteConsultInput {
  symptoms?: string;
  summary?: string;
  recommendations?: string;
  prescriptions?: {
    medication: string;
    dose: string;
    instructions?: string;
  }[];
}