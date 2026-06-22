import type {
  QueueDepartment,
  QueueEntry,
  QueueStatus,
} from "@/lib/types/queue";
import { compareWaiting, minutesSince } from "@/lib/queue-utils";

export const delay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const DEPARTMENTS = [
  { id: "cardiology", name: "Cardiology", room: "Room 2" },
  { id: "pediatrics", name: "Pediatrics", room: "Room 5" },
  { id: "emergency", name: "Emergency", room: "Bay 1" },
  { id: "general-medicine", name: "General Medicine", room: "Room 8" },
] as const;

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

// Mutable store. Lives in the browser for the session; resets on full reload.
// In prod this whole file stops being imported (NEXT_PUBLIC_USE_MOCK=false).
let entries: QueueEntry[] = [
  // Cardiology
  { id: "q-a13", ticketNumber: "A-013", patientName: "Kwame Mensah", departmentId: "cardiology", status: "in_consultation", priority: "routine", source: "appointment", checkInAt: minsAgo(28), calledAt: minsAgo(9), clinician: "Dr. Owusu", room: "Room 2" },
  { id: "q-a14", ticketNumber: "A-014", patientName: "Abena Asante", departmentId: "cardiology", status: "waiting", priority: "urgent", source: "walk_in", checkInAt: minsAgo(22) },
  { id: "q-a15", ticketNumber: "A-015", patientName: "Yaw Darko", departmentId: "cardiology", status: "waiting", priority: "routine", source: "appointment", checkInAt: minsAgo(15) },
  { id: "q-a16", ticketNumber: "A-016", patientName: "Esi Boateng", departmentId: "cardiology", status: "waiting", priority: "routine", source: "walk_in", checkInAt: minsAgo(6) },
  // Pediatrics
  { id: "q-p41", ticketNumber: "P-041", patientName: "Ama Owusu", departmentId: "pediatrics", status: "in_consultation", priority: "routine", source: "appointment", checkInAt: minsAgo(24), calledAt: minsAgo(7), clinician: "Dr. Adjei", room: "Room 5" },
  { id: "q-p42", ticketNumber: "P-042", patientName: "Kojo Antwi", departmentId: "pediatrics", status: "waiting", priority: "urgent", source: "walk_in", checkInAt: minsAgo(33) },
  { id: "q-p43", ticketNumber: "P-043", patientName: "Akosua Frimpong", departmentId: "pediatrics", status: "waiting", priority: "routine", source: "appointment", checkInAt: minsAgo(12) },
  { id: "q-p44", ticketNumber: "P-044", patientName: "Kofi Adjei", departmentId: "pediatrics", status: "waiting", priority: "routine", source: "walk_in", checkInAt: minsAgo(4) },
  // Emergency
  { id: "q-e08", ticketNumber: "E-008", patientName: "Nana Acheampong", departmentId: "emergency", status: "in_consultation", priority: "emergency", source: "walk_in", checkInAt: minsAgo(18), calledAt: minsAgo(12), clinician: "Dr. Boateng", room: "Bay 1" },
  { id: "q-e09", ticketNumber: "E-009", patientName: "Adwoa Sarpong", departmentId: "emergency", status: "waiting", priority: "emergency", source: "walk_in", checkInAt: minsAgo(44) },
  { id: "q-e10", ticketNumber: "E-010", patientName: "Kwabena Osei", departmentId: "emergency", status: "waiting", priority: "urgent", source: "walk_in", checkInAt: minsAgo(20) },
  // General Medicine
  { id: "q-g101", ticketNumber: "G-101", patientName: "Efua Tetteh", departmentId: "general-medicine", status: "in_consultation", priority: "routine", source: "appointment", checkInAt: minsAgo(16), calledAt: minsAgo(5), clinician: "Dr. Mensah", room: "Room 8" },
  { id: "q-g102", ticketNumber: "G-102", patientName: "Yaa Agyeman", departmentId: "general-medicine", status: "waiting", priority: "routine", source: "appointment", checkInAt: minsAgo(9) },
  { id: "q-g103", ticketNumber: "G-103", patientName: "Kwesi Appiah", departmentId: "general-medicine", status: "waiting", priority: "routine", source: "walk_in", checkInAt: minsAgo(3) },
];

export function listEntries(): QueueEntry[] {
  return entries;
}

export function setStatus(id: string, status: QueueStatus): void {
  entries = entries.map((e) => (e.id === id ? { ...e, status } : e));
}

export function promoteNext(departmentId: string, entryId?: string): void {
  const target = entryId
    ? entries.find((e) => e.id === entryId && e.status === "waiting")
    : entries
        .filter((e) => e.departmentId === departmentId && e.status === "waiting")
        .sort(compareWaiting)[0];
  if (!target) return;

  const dept = DEPARTMENTS.find((d) => d.id === target.departmentId);
  entries = entries.map((e) =>
    e.id === target.id
      ? {
          ...e,
          status: "in_consultation",
          calledAt: new Date().toISOString(),
          clinician: e.clinician ?? "Dr. On Call",
          room: e.room ?? dept?.room ?? "Room 1",
        }
      : e,
  );
}

export function buildDepartments(all: QueueEntry[]): QueueDepartment[] {
  return DEPARTMENTS.map((d) => {
    const deptEntries = all.filter((e) => e.departmentId === d.id);
    const waiting = deptEntries.filter((e) => e.status === "waiting");
    const serving = deptEntries.find((e) => e.status === "in_consultation");
    const longest = waiting.reduce(
      (max, e) => Math.max(max, minutesSince(e.checkInAt)),
      0,
    );
    return {
      id: d.id,
      name: d.name,
      waiting: waiting.length,
      nowServing: serving?.ticketNumber ?? null,
      longestWaitMinutes: longest,
      severity: longest > 40 ? "critical" : longest > 25 ? "warning" : "ok",
    };
  });
}