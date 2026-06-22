import type {
  CreateDepartmentInput,
  Department,
  DepartmentStats,
  UpdateDepartmentInput,
} from "@/lib/types/departments";

const seed: Department[] = [
  {
    id: "cardiology",
    name: "Cardiology",
    code: "CARD",
    description: "Heart and cardiovascular care",
    status: "active",
    headDoctorName: "Dr. Owusu",
    doctorsOnDuty: 2,
    totalDoctors: 3,
    rooms: 3,
    waiting: 1,
    inConsultation: 1,
    avgWaitMinutes: 22,
    appointmentsToday: 5,
    opensAt: "08:00",
    closesAt: "17:00",
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    code: "PEDS",
    description: "Child and infant health",
    status: "active",
    headDoctorName: "Dr. Adjei",
    doctorsOnDuty: 1,
    totalDoctors: 2,
    rooms: 2,
    waiting: 2,
    inConsultation: 1,
    avgWaitMinutes: 15,
    appointmentsToday: 3,
    opensAt: "08:00",
    closesAt: "16:00",
  },
  {
    id: "emergency",
    name: "Emergency",
    code: "EMG",
    description: "Acute and emergency care",
    status: "active",
    headDoctorName: "Dr. Mensima",
    doctorsOnDuty: 4,
    totalDoctors: 5,
    rooms: 5,
    waiting: 0,
    inConsultation: 3,
    avgWaitMinutes: 8,
    appointmentsToday: 1,
    opensAt: "00:00",
    closesAt: "23:59",
    twentyFourSeven: true,
  },
  {
    id: "general-medicine",
    name: "General Medicine",
    code: "GEN",
    description: "Outpatient general consultation",
    status: "active",
    headDoctorName: "Dr. Boateng",
    doctorsOnDuty: 2,
    totalDoctors: 4,
    rooms: 4,
    waiting: 0,
    inConsultation: 2,
    avgWaitMinutes: 18,
    appointmentsToday: 4,
    opensAt: "08:00",
    closesAt: "17:00",
  },
  {
    id: "maternity",
    name: "Maternity",
    code: "MAT",
    description: "Antenatal, delivery and postnatal care",
    status: "active",
    headDoctorName: "Dr. Asantewaa",
    doctorsOnDuty: 2,
    totalDoctors: 3,
    rooms: 3,
    waiting: 1,
    inConsultation: 1,
    avgWaitMinutes: 12,
    appointmentsToday: 2,
    opensAt: "00:00",
    closesAt: "23:59",
    twentyFourSeven: true,
  },
  {
    id: "laboratory",
    name: "Laboratory",
    code: "LAB",
    description: "Diagnostics and sample processing",
    status: "closed",
    headDoctorName: "Dr. Yeboah",
    doctorsOnDuty: 0,
    totalDoctors: 2,
    rooms: 2,
    waiting: 0,
    inConsultation: 0,
    avgWaitMinutes: 0,
    appointmentsToday: 0,
    opensAt: "08:00",
    closesAt: "15:00",
  },
];

// Mutable in-session store so the open/close toggle persists during a session.
let store: Department[] = seed.map((d) => ({ ...d }));

function delay<T>(value: T, ms = 160): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Active first, then alphabetical — keeps closed departments at the bottom.
function ordered(list: Department[]): Department[] {
  return [...list].sort((a, b) => {
    if (a.status !== b.status) return a.status === "active" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function listDepartments(): Promise<Department[]> {
  return delay(ordered(store).map((d) => ({ ...d })));
}

export function computeStats(): Promise<DepartmentStats> {
  const stats = store.reduce<DepartmentStats>(
    (acc, d) => {
      acc.total += 1;
      if (d.status === "active") {
        acc.active += 1;
        acc.doctorsOnDuty += d.doctorsOnDuty;
        acc.waiting += d.waiting;
      } else {
        acc.closed += 1;
      }
      acc.rooms += d.rooms;
      return acc;
    },
    { total: 0, active: 0, closed: 0, doctorsOnDuty: 0, rooms: 0, waiting: 0 }
  );
  return delay(stats);
}

export function applyUpdate(input: UpdateDepartmentInput): Promise<Department> {
  const found = store.find((d) => d.id === input.id);
  if (!found) {
    return Promise.reject(new Error(`Department ${input.id} not found`));
  }
  const { id, ...patch } = input;
  Object.assign(found, patch);
  // Closing a department zeroes its live floor activity.
  if (patch.status === "closed") {
    found.doctorsOnDuty = 0;
    found.waiting = 0;
    found.inConsultation = 0;
  }
  return delay({ ...found });
}

export function createDepartment(
  input: CreateDepartmentInput
): Promise<Department> {
  const department: Department = {
    id: crypto.randomUUID(),
    name: input.name,
    code: input.code,
    description: input.description,
    status: "active",
    headDoctorName: input.headDoctorName,
    doctorsOnDuty: input.totalDoctors,
    totalDoctors: input.totalDoctors,
    rooms: input.rooms,
    waiting: 0,
    inConsultation: 0,
    avgWaitMinutes: 0,
    appointmentsToday: 0,
    opensAt: input.opensAt,
    closesAt: input.closesAt,
    twentyFourSeven: input.twentyFourSeven,
  };
  store.push(department);
  return delay({ ...department });
}

export function resetDepartments(): void {
  store = seed.map((d) => ({ ...d }));
}