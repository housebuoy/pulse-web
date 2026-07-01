// Backend contract for staff. Spring Boot serializes to these shapes.

// Doubles as the access role used by Settings → Team & Access (staff ARE the
// users — there's no separate user/role list). "front-desk" and "read-only"
// only make sense as access levels, not clinical job titles, but living on
// the same field keeps one source of truth instead of a parallel enum.
export type StaffRole = "doctor" | "nurse" | "admin" | "front-desk" | "read-only";

export type DutyStatus = "on_duty" | "off_duty" | "on_leave";

export type AccountStatus = "active" | "deactivated";

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  title: string; // "Cardiologist", "Head Nurse", "Front Desk"
  specialty?: string; // doctors only, e.g. "Interventional Cardiology"
  departmentId: string; // "" when unassigned
  departmentName: string;
  email: string;
  phone?: string;
  shiftStart: string; // "08:00"
  shiftEnd: string; // "17:00"
  dutyStatus: DutyStatus;
  accountStatus?: AccountStatus; // undefined === "active"; system access, not clinical duty
  avatarUrl?: string; // object URL from ImageUpload (mock-only; not persisted past refresh)
}

export interface CreateStaffInput {
  name: string;
  role: StaffRole;
  title: string;
  specialty?: string;
  departmentId: string;
  departmentName: string;
  email: string;
  phone?: string;
  shiftStart: string;
  shiftEnd: string;
}

// The editable fields shared by the add and edit forms.
export type StaffFormValues = CreateStaffInput;

export interface UpdateStaffInput {
  id: string;
  name?: string;
  role?: StaffRole;
  title?: string;
  specialty?: string;
  departmentId?: string;
  departmentName?: string;
  email?: string;
  phone?: string;
  shiftStart?: string;
  shiftEnd?: string;
  dutyStatus?: DutyStatus;
  accountStatus?: AccountStatus;
  avatarUrl?: string;
}
