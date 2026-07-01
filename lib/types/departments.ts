// Backend contract for departments. Spring Boot serializes to these shapes.

export type DepartmentStatus = "active" | "closed" | "archived";

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

export interface UpdateDepartmentInput {
  id: string;
  status?: DepartmentStatus;
  name?: string;
  code?: string;
  description?: string;
  headDoctorName?: string;
  totalDoctors?: number;
  rooms?: number;
  opensAt?: string;
  closesAt?: string;
  twentyFourSeven?: boolean;
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

// The editable fields shared by the create and edit forms.
export type DepartmentFormValues = CreateDepartmentInput;

export interface AssignHeadDoctorInput {
  id: string;
  headDoctorName: string;
}
