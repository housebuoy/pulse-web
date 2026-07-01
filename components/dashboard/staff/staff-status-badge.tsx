import { StatusBadge } from "@/components/dashboard/status-badge";
import { DUTY_META } from "@/lib/staff-utils";
import type { DutyStatus } from "@/lib/types/staff";

export function StaffStatusBadge({ status }: { status: DutyStatus }) {
  const { label, tone } = DUTY_META[status];
  return <StatusBadge tone={tone} label={label} dot />;
}
