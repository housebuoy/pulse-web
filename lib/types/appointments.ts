// The backend contract. Spring Boot should serialize to exactly these shapes.
// Nothing in the UI imports raw data — it all flows through lib/api/appointments.ts.

export type AppointmentStatus =
  | "scheduled" // booked, patient hasn't confirmed
  | "confirmed" // patient confirmed they're coming
  | "checked_in" // patient has arrived at the desk (hand-off point to Live Queue)
  | "completed" // visit finished
  | "cancelled" // called off ahead of time
  | "no_show"; // confirmed but never arrived

export type AppointmentType = "in_person" | "virtual";

export type AppointmentPriority = "emergency" | "urgent" | "routine";

export interface Appointment {
  id: string;
  reference: string; // human-facing code, e.g. "APT-1041"
  patientId: string;
  patientName: string;
  departmentId: string;
  departmentName: string;
  doctorName: string;
  scheduledAt: string; // ISO datetime
  durationMinutes: number;
  status: AppointmentStatus;
  type: AppointmentType;
  priority: AppointmentPriority;
  reason?: string;
}

export interface AppointmentDepartment {
  id: string;
  name: string;
}

export interface AppointmentStats {
  total: number;
  scheduled: number;
  confirmed: number;
  checkedIn: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

// Sent to the API. The page only ever sets `date`; department/status filtering
// is done client-side for snappy tabs, but the contract supports server-side
// filtering for when the dataset outgrows a single day's payload.
export interface AppointmentFilters {
  date: string; // YYYY-MM-DD (local)
  departmentId?: string | "all";
  status?: AppointmentStatus | "all";
}

export interface UpdateAppointmentInput {
  id: string;
  status: AppointmentStatus;
}