import type {
  CreatePatientInput,
  Patient,
  RecordVitalsInput,
  UpdateClinicalRecordInput,
  UpdatePatientInput,
} from "@/lib/types/patients";

function todayAt(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const seed: Patient[] = [
  {
    id: "patient-kwame-mensah",
    patientNumber: "PT-00101",
    name: "Kwame Mensah",
    dateOfBirth: "1985-03-12",
    gender: "male",
    phone: "+233 20 111 0001",
    email: "kwame.mensah@example.test",
    address: "12 Ring Road, Accra",
    registeredAt: "2023-01-10T09:00:00.000Z",
    bloodType: "O+",
    allergies: ["Penicillin"],
    currentMedications: [
      { name: "Lisinopril", dose: "10mg", frequency: "Once daily" },
    ],
    latestVitals: {
      bloodPressure: "138/86",
      temperature: "36.8°C",
      pulse: "78 bpm",
      weight: "82 kg",
      recordedAt: todayAt(9, 15),
    },
    currentVisit: {
      status: "waiting",
      departmentId: "cardiology",
      departmentName: "Cardiology",
      since: todayAt(9, 10),
    },
  },
  {
    id: "patient-abena-asante",
    patientNumber: "PT-00102",
    name: "Abena Asante",
    dateOfBirth: "1990-07-22",
    gender: "female",
    phone: "+233 20 111 0002",
    email: "abena.asante@example.test",
    registeredAt: "2023-02-14T09:00:00.000Z",
    allergies: [],
    currentMedications: [],
  },
  {
    id: "patient-kwabena-ofori",
    patientNumber: "PT-00103",
    name: "Kwabena Ofori",
    dateOfBirth: "1978-11-02",
    gender: "male",
    phone: "+233 20 111 0003",
    registeredAt: "2022-08-09T09:00:00.000Z",
    bloodType: "A+",
    allergies: [],
    currentMedications: [],
  },
  {
    id: "patient-yaw-darko",
    patientNumber: "PT-00104",
    name: "Yaw Darko",
    dateOfBirth: "1995-01-15",
    gender: "male",
    phone: "+233 20 111 0004",
    email: "yaw.darko@example.test",
    registeredAt: "2023-05-20T09:00:00.000Z",
    bloodType: "B+",
    allergies: ["Sulfa drugs"],
    currentMedications: [
      { name: "Metformin", dose: "500mg", frequency: "Twice daily" },
    ],
    latestVitals: {
      bloodPressure: "126/82",
      temperature: "37.1°C",
      pulse: "88 bpm",
      weight: "76 kg",
      recordedAt: todayAt(9, 42),
    },
    currentVisit: {
      status: "in_consultation",
      departmentId: "general-medicine",
      departmentName: "General Medicine",
      since: todayAt(9, 40),
    },
  },
  {
    id: "patient-ama-owusu",
    patientNumber: "PT-00105",
    name: "Ama Owusu",
    dateOfBirth: "2016-05-30",
    gender: "female",
    phone: "+233 20 111 0005",
    registeredAt: "2023-03-01T09:00:00.000Z",
    allergies: [],
    currentMedications: [],
    latestVitals: {
      bloodPressure: "98/60",
      temperature: "38.2°C",
      pulse: "110 bpm",
      weight: "18 kg",
      recordedAt: todayAt(10, 7),
    },
    currentVisit: {
      status: "checked_in",
      departmentId: "pediatrics",
      departmentName: "Pediatrics",
      since: todayAt(10, 5),
      appointmentId: "apt-1045",
    },
  },
  {
    id: "patient-kofi-antwi",
    patientNumber: "PT-00106",
    name: "Kofi Antwi",
    dateOfBirth: "1972-09-09",
    gender: "male",
    phone: "+233 20 111 0006",
    registeredAt: "2021-12-12T09:00:00.000Z",
    bloodType: "AB-",
    allergies: ["Latex"],
    currentMedications: [],
    latestVitals: {
      bloodPressure: "150/95",
      temperature: "37.4°C",
      pulse: "102 bpm",
      weight: "90 kg",
      recordedAt: todayAt(9, 58),
    },
    currentVisit: {
      status: "in_consultation",
      departmentId: "emergency",
      departmentName: "Emergency",
      since: todayAt(9, 55),
      appointmentId: "apt-1046",
    },
  },
  {
    id: "patient-adwoa-sarpong",
    patientNumber: "PT-00107",
    name: "Adwoa Sarpong",
    dateOfBirth: "1988-04-18",
    gender: "female",
    phone: "+233 20 111 0007",
    registeredAt: "2023-07-19T09:00:00.000Z",
    allergies: [],
    currentMedications: [],
  },
  {
    id: "patient-esi-mensah",
    patientNumber: "PT-00108",
    name: "Esi Mensah",
    dateOfBirth: "2019-02-02",
    gender: "female",
    phone: "+233 20 111 0008",
    registeredAt: "2023-09-09T09:00:00.000Z",
    allergies: [],
    currentMedications: [],
  },
  {
    id: "patient-kojo-asare",
    patientNumber: "PT-00109",
    name: "Kojo Asare",
    dateOfBirth: "1965-12-25",
    gender: "male",
    phone: "+233 20 111 0009",
    registeredAt: "2020-06-06T09:00:00.000Z",
    bloodType: "O-",
    allergies: ["Ibuprofen"],
    currentMedications: [
      { name: "Atorvastatin", dose: "20mg", frequency: "Once nightly" },
    ],
    latestVitals: {
      bloodPressure: "142/90",
      temperature: "36.6°C",
      pulse: "74 bpm",
      weight: "79 kg",
      recordedAt: "2026-05-02T10:30:00.000Z",
    },
  },
  {
    id: "patient-akua-frimpong",
    patientNumber: "PT-00110",
    name: "Akua Frimpong",
    dateOfBirth: "1999-06-11",
    gender: "female",
    phone: "+233 20 111 0010",
    registeredAt: "2024-01-01T09:00:00.000Z",
    allergies: [],
    currentMedications: [],
  },
  {
    id: "patient-yaa-boatemaa",
    patientNumber: "PT-00111",
    name: "Yaa Boatemaa",
    dateOfBirth: "2020-08-08",
    gender: "female",
    phone: "+233 20 111 0011",
    registeredAt: "2024-02-02T09:00:00.000Z",
    allergies: [],
    currentMedications: [],
  },
  {
    id: "patient-nana-addo",
    patientNumber: "PT-00112",
    name: "Nana Addo",
    dateOfBirth: "1955-03-03",
    gender: "male",
    phone: "+233 20 111 0012",
    registeredAt: "2019-11-11T09:00:00.000Z",
    bloodType: "A-",
    allergies: [],
    currentMedications: [
      { name: "Amlodipine", dose: "5mg", frequency: "Once daily" },
      { name: "Aspirin", dose: "75mg", frequency: "Once daily" },
    ],
    latestVitals: {
      bloodPressure: "150/92",
      temperature: "36.5°C",
      pulse: "70 bpm",
      weight: "68 kg",
      recordedAt: "2026-04-18T11:00:00.000Z",
    },
  },
  {
    id: "patient-efua-koomson",
    patientNumber: "PT-00113",
    name: "Efua Koomson",
    dateOfBirth: "1992-10-10",
    gender: "female",
    phone: "+233 20 111 0013",
    registeredAt: "2023-04-04T09:00:00.000Z",
    bloodType: "B-",
    allergies: [],
    currentMedications: [],
    latestVitals: {
      bloodPressure: "118/76",
      temperature: "36.9°C",
      pulse: "84 bpm",
      weight: "70 kg",
      recordedAt: todayAt(10, 22),
    },
    currentVisit: {
      status: "waiting",
      departmentId: "maternity",
      departmentName: "Maternity",
      since: todayAt(10, 20),
    },
  },
  {
    id: "patient-mensah-boakye",
    patientNumber: "PT-00114",
    name: "Mensah Boakye",
    dateOfBirth: "1980-01-01",
    gender: "male",
    phone: "+233 20 111 0014",
    registeredAt: "2022-02-02T09:00:00.000Z",
    allergies: [],
    currentMedications: [],
  },
  {
    id: "patient-akosua-danso",
    patientNumber: "PT-00115",
    name: "Akosua Danso",
    dateOfBirth: "1993-07-07",
    gender: "female",
    phone: "+233 20 111 0015",
    registeredAt: "2023-08-08T09:00:00.000Z",
    allergies: [],
    currentMedications: [],
  },
  {
    id: "patient-kwesi-appiah",
    patientNumber: "PT-00116",
    name: "Kwesi Appiah",
    dateOfBirth: "1960-11-11",
    gender: "male",
    phone: "+233 20 111 0016",
    registeredAt: "2021-05-05T09:00:00.000Z",
    bloodType: "O+",
    allergies: [],
    currentMedications: [],
  },
];

// Mutable in-session store so registrations/edits persist during a session.
let store: Patient[] = seed.map((p) => ({ ...p }));

function delay<T>(value: T, ms = 160): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextPatientNumber(): string {
  const max = store.reduce((acc, p) => {
    const n = Number(p.patientNumber.replace("PT-", ""));
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `PT-${String(max + 1).padStart(5, "0")}`;
}

export function listPatients(): Promise<Patient[]> {
  return delay(store.map((p) => ({ ...p })));
}

export function getPatient(id: string): Promise<Patient> {
  const found = store.find((p) => p.id === id);
  if (!found) {
    return Promise.reject(new Error(`Patient ${id} not found`));
  }
  return delay({ ...found });
}

export function createPatient(input: CreatePatientInput): Promise<Patient> {
  const patient: Patient = {
    id: crypto.randomUUID(),
    patientNumber: nextPatientNumber(),
    registeredAt: new Date().toISOString(),
    allergies: [],
    currentMedications: [],
    ...input,
  };
  store.push(patient);
  return delay({ ...patient });
}

export function applyUpdate(input: UpdatePatientInput): Promise<Patient> {
  const found = store.find((p) => p.id === input.id);
  if (!found) {
    return Promise.reject(new Error(`Patient ${input.id} not found`));
  }
  const { id, ...patch } = input;
  Object.assign(found, patch);
  return delay({ ...found });
}

export function applyClinicalRecordUpdate(
  input: UpdateClinicalRecordInput
): Promise<Patient> {
  const found = store.find((p) => p.id === input.id);
  if (!found) {
    return Promise.reject(new Error(`Patient ${input.id} not found`));
  }
  const { id, ...patch } = input;
  Object.assign(found, patch);
  return delay({ ...found });
}

export function applyVitals(input: RecordVitalsInput): Promise<Patient> {
  const found = store.find((p) => p.id === input.id);
  if (!found) {
    return Promise.reject(new Error(`Patient ${input.id} not found`));
  }
  found.latestVitals = { ...input.vitals, recordedAt: new Date().toISOString() };
  return delay({ ...found });
}

export function resetPatients(): void {
  store = seed.map((p) => ({ ...p }));
}
