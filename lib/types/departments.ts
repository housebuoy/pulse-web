// Backend contract for departments. Spring Boot serializes to these shapes.

export type DepartmentStatus = "active" | "closed";

export interface Department {
  id: string;
  name: string;
  code: string; // short code, e.g. "CARD"
  description?: string;
  status: DepartmentStatus;
  headDoctorName: string;

  // staffing / capacity
  doctorsOnDuty: number;
  totalDoctors: number;
  rooms: number;

  // live operational stats
  waiting: number;
  inConsultation: number;
  avgWaitMinutes: number;
  appointmentsToday: number;

  // hours
  opensAt: string; // "08:00"
  closesAt: string; // "17:00"
  twentyFourSeven?: boolean;
}

export interface DepartmentStats {
  total: number;
  active: number;
  closed: number;
  doctorsOnDuty: number;
  rooms: number;
  waiting: number;
}

// Partial update — only `status` is wired today (the open/close toggle), but
// the contract is open for editing other fields once the form lands.
export interface UpdateDepartmentInput {
  id: string;
  status?: DepartmentStatus;
  name?: string;
  headDoctorName?: string;
  rooms?: number;
  opensAt?: string;
  closesAt?: string;
}

export interface CreateDepartmentInput {
  name: string;
  code: string;
  description?: string;
  headDoctorName: string;
  totalDoctors: number;
  rooms: number;
  opensAt: string;
  closesAt: string;
  twentyFourSeven?: boolean;
}