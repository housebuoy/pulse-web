import type { Department, DepartmentStatus } from "@/lib/types/departments";
import type { BadgeTone } from "@/components/dashboard/status-badge";

export const DEPT_STATUS_META: Record<
  DepartmentStatus,
  { label: string; tone: BadgeTone }
> = {
  active: { label: "Active", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
  archived: { label: "Archived", tone: "neutral" },
};

export function formatHours(d: Department): string {
  if (d.twentyFourSeven) return "Open 24/7";
  return `${d.opensAt} – ${d.closesAt}`;
}

// Colours the "Waiting" figure so a backed-up department reads at a glance.
export type LoadTone = "success" | "warning" | "danger";

export function loadTone(waiting: number): LoadTone {
  if (waiting >= 5) return "danger";
  if (waiting >= 2) return "warning";
  return "success";
}

export function matchesSearch(d: Department, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    d.name.toLowerCase().includes(q) ||
    d.code.toLowerCase().includes(q) ||
    d.headDoctorName.toLowerCase().includes(q)
  );
}

// A department can only be hard-deleted once its floor is clear — otherwise
// the dialog offers Archive (soft status) instead.
export function canDelete(d: Department): boolean {
  return (
    d.waiting === 0 && d.inConsultation === 0 && d.appointmentsToday === 0
  );
}
