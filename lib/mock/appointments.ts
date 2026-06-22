import type {
  Appointment,
  AppointmentDepartment,
  AppointmentFilters,
  AppointmentStats,
  UpdateAppointmentInput,
} from "@/lib/types/appointments";

const DEPARTMENTS: AppointmentDepartment[] = [
  { id: "cardiology", name: "Cardiology" },
  { id: "pediatrics", name: "Pediatrics" },
  { id: "emergency", name: "Emergency" },
  { id: "general-medicine", name: "General Medicine" },
];

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function at(key: string, hour: number, min: number): string {
  const d = new Date(`${key}T00:00:00`);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

const TODAY = dateKey(new Date());
const YESTERDAY = dateKey(new Date(Date.now() - 86_400_000));
const TOMORROW = dateKey(new Date(Date.now() + 86_400_000));

const seed: Appointment[] = [
  // ---- today ----
  {
    id: "apt-1041",
    reference: "APT-1041",
    patientId: "p-001",
    patientName: "Kwame Mensah",
    departmentId: "cardiology",
    departmentName: "Cardiology",
    doctorName: "Dr. Owusu",
    scheduledAt: at(TODAY, 8, 0),
    durationMinutes: 30,
    status: "completed",
    type: "in_person",
    priority: "routine",
    reason: "Hypertension follow-up",
  },
  {
    id: "apt-1042",
    reference: "APT-1042",
    patientId: "p-002",
    patientName: "Abena Asante",
    departmentId: "cardiology",
    departmentName: "Cardiology",
    doctorName: "Dr. Owusu",
    scheduledAt: at(TODAY, 8, 30),
    durationMinutes: 30,
    status: "completed",
    type: "in_person",
    priority: "routine",
    reason: "ECG review",
  },
  {
    id: "apt-1043",
    reference: "APT-1043",
    patientId: "p-003",
    patientName: "Kwabena Ofori",
    departmentId: "general-medicine",
    departmentName: "General Medicine",
    doctorName: "Dr. Boateng",
    scheduledAt: at(TODAY, 8, 15),
    durationMinutes: 20,
    status: "no_show",
    type: "in_person",
    priority: "routine",
    reason: "Lab results",
  },
  {
    id: "apt-1044",
    reference: "APT-1044",
    patientId: "p-004",
    patientName: "Yaw Darko",
    departmentId: "general-medicine",
    departmentName: "General Medicine",
    doctorName: "Dr. Boateng",
    scheduledAt: at(TODAY, 9, 0),
    durationMinutes: 20,
    status: "checked_in",
    type: "in_person",
    priority: "routine",
    reason: "General consultation",
  },
  {
    id: "apt-1045",
    reference: "APT-1045",
    patientId: "p-005",
    patientName: "Ama Owusu",
    departmentId: "pediatrics",
    departmentName: "Pediatrics",
    doctorName: "Dr. Adjei",
    scheduledAt: at(TODAY, 9, 15),
    durationMinutes: 30,
    status: "checked_in",
    type: "in_person",
    priority: "urgent",
    reason: "Child fever",
  },
  {
    id: "apt-1046",
    reference: "APT-1046",
    patientId: "p-006",
    patientName: "Kofi Antwi",
    departmentId: "emergency",
    departmentName: "Emergency",
    doctorName: "Dr. Mensima",
    scheduledAt: at(TODAY, 9, 45),
    durationMinutes: 45,
    status: "checked_in",
    type: "in_person",
    priority: "emergency",
    reason: "Chest pain",
  },
  {
    id: "apt-1047",
    reference: "APT-1047",
    patientId: "p-007",
    patientName: "Adwoa Sarpong",
    departmentId: "cardiology",
    departmentName: "Cardiology",
    doctorName: "Dr. Owusu",
    scheduledAt: at(TODAY, 10, 0),
    durationMinutes: 30,
    status: "confirmed",
    type: "in_person",
    priority: "routine",
    reason: "Palpitations",
  },
  {
    id: "apt-1048",
    reference: "APT-1048",
    patientId: "p-008",
    patientName: "Esi Mensah",
    departmentId: "pediatrics",
    departmentName: "Pediatrics",
    doctorName: "Dr. Adjei",
    scheduledAt: at(TODAY, 10, 30),
    durationMinutes: 20,
    status: "confirmed",
    type: "virtual",
    priority: "routine",
    reason: "Vaccination follow-up",
  },
  {
    id: "apt-1049",
    reference: "APT-1049",
    patientId: "p-009",
    patientName: "Kojo Asare",
    departmentId: "general-medicine",
    departmentName: "General Medicine",
    doctorName: "Dr. Boateng",
    scheduledAt: at(TODAY, 11, 0),
    durationMinutes: 30,
    status: "confirmed",
    type: "in_person",
    priority: "routine",
    reason: "Diabetes review",
  },
  {
    id: "apt-1050",
    reference: "APT-1050",
    patientId: "p-010",
    patientName: "Akua Frimpong",
    departmentId: "cardiology",
    departmentName: "Cardiology",
    doctorName: "Dr. Owusu",
    scheduledAt: at(TODAY, 11, 30),
    durationMinutes: 30,
    status: "scheduled",
    type: "in_person",
    priority: "routine",
    reason: "New patient intake",
  },
  {
    id: "apt-1051",
    reference: "APT-1051",
    patientId: "p-011",
    patientName: "Yaa Boatemaa",
    departmentId: "pediatrics",
    departmentName: "Pediatrics",
    doctorName: "Dr. Adjei",
    scheduledAt: at(TODAY, 12, 0),
    durationMinutes: 20,
    status: "scheduled",
    type: "virtual",
    priority: "routine",
    reason: "Growth check",
  },
  {
    id: "apt-1052",
    reference: "APT-1052",
    patientId: "p-012",
    patientName: "Nana Addo",
    departmentId: "general-medicine",
    departmentName: "General Medicine",
    doctorName: "Dr. Boateng",
    scheduledAt: at(TODAY, 13, 0),
    durationMinutes: 30,
    status: "scheduled",
    type: "in_person",
    priority: "urgent",
    reason: "Persistent cough",
  },
  {
    id: "apt-1053",
    reference: "APT-1053",
    patientId: "p-013",
    patientName: "Efua Koomson",
    departmentId: "cardiology",
    departmentName: "Cardiology",
    doctorName: "Dr. Owusu",
    scheduledAt: at(TODAY, 14, 0),
    durationMinutes: 30,
    status: "cancelled",
    type: "in_person",
    priority: "routine",
    reason: "Routine check",
  },

  // ---- yesterday ----
  {
    id: "apt-1030",
    reference: "APT-1030",
    patientId: "p-014",
    patientName: "Mensah Boakye",
    departmentId: "general-medicine",
    departmentName: "General Medicine",
    doctorName: "Dr. Boateng",
    scheduledAt: at(YESTERDAY, 10, 0),
    durationMinutes: 20,
    status: "completed",
    type: "in_person",
    priority: "routine",
    reason: "Malaria follow-up",
  },
  {
    id: "apt-1031",
    reference: "APT-1031",
    patientId: "p-015",
    patientName: "Akosua Danso",
    departmentId: "pediatrics",
    departmentName: "Pediatrics",
    doctorName: "Dr. Adjei",
    scheduledAt: at(YESTERDAY, 11, 30),
    durationMinutes: 30,
    status: "completed",
    type: "in_person",
    priority: "routine",
    reason: "Routine immunisation",
  },

  // ---- tomorrow ----
  {
    id: "apt-1060",
    reference: "APT-1060",
    patientId: "p-016",
    patientName: "Kwesi Appiah",
    departmentId: "cardiology",
    departmentName: "Cardiology",
    doctorName: "Dr. Owusu",
    scheduledAt: at(TOMORROW, 9, 0),
    durationMinutes: 30,
    status: "confirmed",
    type: "in_person",
    priority: "routine",
    reason: "Stress test",
  },
  {
    id: "apt-1061",
    reference: "APT-1061",
    patientId: "p-017",
    patientName: "Abena Nyarko",
    departmentId: "general-medicine",
    departmentName: "General Medicine",
    doctorName: "Dr. Boateng",
    scheduledAt: at(TOMORROW, 10, 30),
    durationMinutes: 20,
    status: "scheduled",
    type: "in_person",
    priority: "routine",
    reason: "Annual physical",
  },
  {
    id: "apt-1062",
    reference: "APT-1062",
    patientId: "p-018",
    patientName: "Yaw Owusu",
    departmentId: "pediatrics",
    departmentName: "Pediatrics",
    doctorName: "Dr. Adjei",
    scheduledAt: at(TOMORROW, 11, 0),
    durationMinutes: 30,
    status: "scheduled",
    type: "virtual",
    priority: "routine",
    reason: "Allergy consult",
  },
];

// Mutable in-session store, mirroring lib/mock/queue.ts so actions actually
// move appointments through their lifecycle during a session.
let store: Appointment[] = seed.map((a) => ({ ...a }));

function delay<T>(value: T, ms = 160): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function listDepartments(): Promise<AppointmentDepartment[]> {
  return delay(DEPARTMENTS.map((d) => ({ ...d })));
}

export function queryAppointments(
  filters: AppointmentFilters
): Promise<Appointment[]> {
  const { date, departmentId, status } = filters;
  const result = store
    .filter((a) => dateKey(new Date(a.scheduledAt)) === date)
    .filter(
      (a) =>
        !departmentId || departmentId === "all" || a.departmentId === departmentId
    )
    .filter((a) => !status || status === "all" || a.status === status)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .map((a) => ({ ...a }));
  return delay(result);
}

export function computeStats(date: string): Promise<AppointmentStats> {
  const day = store.filter((a) => dateKey(new Date(a.scheduledAt)) === date);
  const count = (s: Appointment["status"]) =>
    day.filter((a) => a.status === s).length;
  return delay({
    total: day.length,
    scheduled: count("scheduled"),
    confirmed: count("confirmed"),
    checkedIn: count("checked_in"),
    completed: count("completed"),
    cancelled: count("cancelled"),
    noShow: count("no_show"),
  });
}

export function applyUpdate({
  id,
  status,
}: UpdateAppointmentInput): Promise<Appointment> {
  const found = store.find((a) => a.id === id);
  if (!found) {
    return Promise.reject(new Error(`Appointment ${id} not found`));
  }
  found.status = status;
  return delay({ ...found });
}

export function resetAppointments(): void {
  store = seed.map((a) => ({ ...a }));
}