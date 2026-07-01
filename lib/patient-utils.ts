import type { BadgeTone } from "@/components/dashboard/status-badge";
import type { Gender, Patient, VisitStatus } from "@/lib/types/patients";

export const GENDER_LABEL: Record<Gender, string> = {
  female: "Female",
  male: "Male",
  other: "Other",
};

export const VISIT_STATUS_LABEL: Record<VisitStatus, string> = {
  checked_in: "Checked in",
  waiting: "Waiting",
  in_consultation: "In consultation",
};

export function visitTone(status: VisitStatus): BadgeTone {
  switch (status) {
    case "in_consultation":
      return "brand";
    case "waiting":
      return "warning";
    case "checked_in":
    default:
      return "success";
  }
}

// Display-only: turns a recorded date of birth into a whole-number age.
// Not a clinical calculation — purely a record-keeping convenience.
export function calculateAge(dateOfBirth: string): number {
  const dob = new Date(`${dateOfBirth}T00:00:00`);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const hadBirthdayThisYear =
    now.getMonth() > dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());
  if (!hadBirthdayThisYear) age -= 1;
  return age;
}

export function isHereToday(patient: Patient): boolean {
  if (!patient.currentVisit) return false;
  const since = new Date(patient.currentVisit.since);
  const now = new Date();
  return (
    since.getFullYear() === now.getFullYear() &&
    since.getMonth() === now.getMonth() &&
    since.getDate() === now.getDate()
  );
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function matchesSearch(patient: Patient, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    patient.name.toLowerCase().includes(q) ||
    patient.patientNumber.toLowerCase().includes(q) ||
    patient.phone.toLowerCase().includes(q)
  );
}
