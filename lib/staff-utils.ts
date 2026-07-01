import type { BadgeTone } from "@/components/dashboard/status-badge";
import type {
  AccountStatus,
  DutyStatus,
  StaffMember,
  StaffRole,
} from "@/lib/types/staff";

export const DUTY_META: Record<DutyStatus, { label: string; tone: BadgeTone }> = {
  on_duty: { label: "On duty", tone: "success" },
  off_duty: { label: "Off duty", tone: "neutral" },
  on_leave: { label: "On leave", tone: "warning" },
};

export const ROLE_LABEL: Record<StaffRole, string> = {
  doctor: "Doctor",
  nurse: "Nurse",
  admin: "Admin",
  "front-desk": "Front Desk",
  "read-only": "Read-only",
};

export const ACCOUNT_STATUS_META: Record<
  AccountStatus,
  { label: string; tone: BadgeTone }
> = {
  active: { label: "Active", tone: "success" },
  deactivated: { label: "Deactivated", tone: "neutral" },
};

export function accountStatusOf(member: StaffMember): AccountStatus {
  return member.accountStatus ?? "active";
}

export function formatShift(member: StaffMember): string {
  return `${member.shiftStart} – ${member.shiftEnd}`;
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

export function matchesSearch(member: StaffMember, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    member.name.toLowerCase().includes(q) ||
    member.title.toLowerCase().includes(q) ||
    member.email.toLowerCase().includes(q) ||
    member.departmentName.toLowerCase().includes(q) ||
    (member.specialty?.toLowerCase().includes(q) ?? false)
  );
}
