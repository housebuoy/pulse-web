import type {
  CreateStaffInput,
  StaffMember,
  UpdateStaffInput,
} from "@/lib/types/staff";

const seed: StaffMember[] = [
  // ---- cardiology ----
  { id: "staff-owusu", name: "Dr. Owusu", role: "doctor", title: "Cardiologist", specialty: "Interventional Cardiology", departmentId: "cardiology", departmentName: "Cardiology", email: "owusu@pulsehealth.test", phone: "+233 24 100 1001", shiftStart: "08:00", shiftEnd: "17:00", dutyStatus: "on_duty" },
  { id: "staff-kusi", name: "Dr. Kusi", role: "doctor", title: "Cardiologist", specialty: "Electrophysiology", departmentId: "cardiology", departmentName: "Cardiology", email: "kusi@pulsehealth.test", shiftStart: "08:00", shiftEnd: "17:00", dutyStatus: "on_duty" },
  { id: "staff-agyeman", name: "Dr. Agyeman", role: "doctor", title: "Cardiologist", specialty: "Cardiac Imaging", departmentId: "cardiology", departmentName: "Cardiology", email: "agyeman@pulsehealth.test", shiftStart: "08:00", shiftEnd: "17:00", dutyStatus: "on_leave" },
  { id: "staff-affum", name: "Nurse Affum", role: "nurse", title: "Senior Nurse", departmentId: "cardiology", departmentName: "Cardiology", email: "affum@pulsehealth.test", shiftStart: "08:00", shiftEnd: "17:00", dutyStatus: "on_duty" },

  // ---- pediatrics ----
  { id: "staff-adjei", name: "Dr. Adjei", role: "doctor", title: "Pediatrician", specialty: "General Pediatrics", departmentId: "pediatrics", departmentName: "Pediatrics", email: "adjei@pulsehealth.test", phone: "+233 24 100 1005", shiftStart: "08:00", shiftEnd: "16:00", dutyStatus: "on_duty" },
  { id: "staff-sarpong", name: "Dr. Sarpong", role: "doctor", title: "Pediatrician", specialty: "Neonatology", departmentId: "pediatrics", departmentName: "Pediatrics", email: "sarpong@pulsehealth.test", shiftStart: "08:00", shiftEnd: "16:00", dutyStatus: "off_duty" },
  { id: "staff-tetteh", name: "Nurse Tetteh", role: "nurse", title: "Triage Nurse", departmentId: "pediatrics", departmentName: "Pediatrics", email: "tetteh@pulsehealth.test", shiftStart: "08:00", shiftEnd: "16:00", dutyStatus: "on_leave" },

  // ---- emergency ----
  { id: "staff-mensima", name: "Dr. Mensima", role: "doctor", title: "Emergency Physician", specialty: "Trauma Medicine", departmentId: "emergency", departmentName: "Emergency", email: "mensima@pulsehealth.test", phone: "+233 24 100 1009", shiftStart: "07:00", shiftEnd: "19:00", dutyStatus: "on_duty" },
  { id: "staff-appiah", name: "Dr. Appiah", role: "doctor", title: "Emergency Physician", specialty: "Critical Care", departmentId: "emergency", departmentName: "Emergency", email: "appiah@pulsehealth.test", shiftStart: "07:00", shiftEnd: "19:00", dutyStatus: "on_duty" },
  { id: "staff-darko", name: "Dr. Darko", role: "doctor", title: "Emergency Physician", specialty: "Emergency Medicine", departmentId: "emergency", departmentName: "Emergency", email: "darko@pulsehealth.test", shiftStart: "19:00", shiftEnd: "07:00", dutyStatus: "on_duty" },
  { id: "staff-nyarko", name: "Dr. Nyarko", role: "doctor", title: "Emergency Physician", specialty: "Emergency Medicine", departmentId: "emergency", departmentName: "Emergency", email: "nyarko@pulsehealth.test", shiftStart: "19:00", shiftEnd: "07:00", dutyStatus: "on_duty" },
  { id: "staff-frimpong", name: "Dr. Frimpong", role: "doctor", title: "Emergency Physician", specialty: "Toxicology", departmentId: "emergency", departmentName: "Emergency", email: "frimpong@pulsehealth.test", shiftStart: "07:00", shiftEnd: "19:00", dutyStatus: "on_leave" },
  { id: "staff-acheampong", name: "Nurse Acheampong", role: "nurse", title: "Charge Nurse", departmentId: "emergency", departmentName: "Emergency", email: "acheampong@pulsehealth.test", shiftStart: "07:00", shiftEnd: "19:00", dutyStatus: "on_duty" },

  // ---- general medicine ----
  { id: "staff-boateng", name: "Dr. Boateng", role: "doctor", title: "General Practitioner", specialty: "Internal Medicine", departmentId: "general-medicine", departmentName: "General Medicine", email: "boateng@pulsehealth.test", phone: "+233 24 100 1015", shiftStart: "08:00", shiftEnd: "17:00", dutyStatus: "on_duty" },
  { id: "staff-antwi", name: "Dr. Antwi", role: "doctor", title: "General Practitioner", specialty: "Family Medicine", departmentId: "general-medicine", departmentName: "General Medicine", email: "antwi@pulsehealth.test", shiftStart: "08:00", shiftEnd: "17:00", dutyStatus: "on_duty" },
  { id: "staff-mensah", name: "Dr. Mensah", role: "doctor", title: "General Practitioner", specialty: "Internal Medicine", departmentId: "general-medicine", departmentName: "General Medicine", email: "mensah@pulsehealth.test", shiftStart: "08:00", shiftEnd: "17:00", dutyStatus: "on_leave" },
  { id: "staff-owusu-ansah", name: "Dr. Owusu-Ansah", role: "doctor", title: "General Practitioner", specialty: "Geriatrics", departmentId: "general-medicine", departmentName: "General Medicine", email: "owusu-ansah@pulsehealth.test", shiftStart: "08:00", shiftEnd: "17:00", dutyStatus: "off_duty" },
  { id: "staff-adwoa", name: "Adwoa Boateng", role: "admin", title: "Front Desk", departmentId: "general-medicine", departmentName: "General Medicine", email: "adwoa@pulsehealth.test", shiftStart: "08:00", shiftEnd: "17:00", dutyStatus: "on_duty" },

  // ---- maternity ----
  { id: "staff-asantewaa", name: "Dr. Asantewaa", role: "doctor", title: "Obstetrician", specialty: "Obstetrics", departmentId: "maternity", departmentName: "Maternity", email: "asantewaa@pulsehealth.test", phone: "+233 24 100 1020", shiftStart: "08:00", shiftEnd: "20:00", dutyStatus: "on_duty" },
  { id: "staff-asare", name: "Dr. Asare", role: "doctor", title: "Obstetrician", specialty: "Gynecologic Surgery", departmentId: "maternity", departmentName: "Maternity", email: "asare@pulsehealth.test", shiftStart: "08:00", shiftEnd: "20:00", dutyStatus: "on_duty" },
  { id: "staff-konadu", name: "Dr. Konadu", role: "doctor", title: "Obstetrician", specialty: "Maternal-Fetal Medicine", departmentId: "maternity", departmentName: "Maternity", email: "konadu@pulsehealth.test", shiftStart: "20:00", shiftEnd: "08:00", dutyStatus: "off_duty" },
  { id: "staff-akoto", name: "Nurse Akoto", role: "nurse", title: "Midwife", departmentId: "maternity", departmentName: "Maternity", email: "akoto@pulsehealth.test", shiftStart: "08:00", shiftEnd: "20:00", dutyStatus: "on_duty" },

  // ---- laboratory ----
  { id: "staff-yeboah", name: "Dr. Yeboah", role: "doctor", title: "Pathologist", specialty: "Anatomic Pathology", departmentId: "laboratory", departmentName: "Laboratory", email: "yeboah@pulsehealth.test", shiftStart: "08:00", shiftEnd: "15:00", dutyStatus: "off_duty" },
  { id: "staff-anim", name: "Dr. Anim", role: "doctor", title: "Pathologist", specialty: "Clinical Pathology", departmentId: "laboratory", departmentName: "Laboratory", email: "anim@pulsehealth.test", shiftStart: "08:00", shiftEnd: "15:00", dutyStatus: "off_duty" },
  { id: "staff-owusu-admin", name: "Kojo Owusu", role: "admin", title: "Lab Admin", departmentId: "laboratory", departmentName: "Laboratory", email: "kojo.owusu@pulsehealth.test", shiftStart: "08:00", shiftEnd: "15:00", dutyStatus: "off_duty" },
];

// Mutable in-session store so reassignment/duty toggles persist during a session.
let store: StaffMember[] = seed.map((s) => ({ ...s }));

function delay<T>(value: T, ms = 160): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function listStaff(): Promise<StaffMember[]> {
  return delay(store.map((s) => ({ ...s })));
}

export function getStaffMember(id: string): Promise<StaffMember> {
  const found = store.find((s) => s.id === id);
  if (!found) {
    return Promise.reject(new Error(`Staff member ${id} not found`));
  }
  return delay({ ...found });
}

export function applyUpdate(input: UpdateStaffInput): Promise<StaffMember> {
  const found = store.find((s) => s.id === input.id);
  if (!found) {
    return Promise.reject(new Error(`Staff member ${input.id} not found`));
  }
  const { id, ...patch } = input;
  Object.assign(found, patch);
  return delay({ ...found });
}

export function createStaff(input: CreateStaffInput): Promise<StaffMember> {
  const member: StaffMember = {
    id: crypto.randomUUID(),
    dutyStatus: "on_duty",
    ...input,
  };
  store.push(member);
  return delay({ ...member });
}

export function resetStaff(): void {
  store = seed.map((s) => ({ ...s }));
}
