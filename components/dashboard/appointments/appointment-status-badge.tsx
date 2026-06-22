import { StatusBadge } from "@/components/dashboard/status-badge";
import { STATUS_META } from "@/lib/appointment-utils";
import type { AppointmentStatus } from "@/lib/types/appointments";

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus;
}) {
  const { label, tone } = STATUS_META[status];
  return <StatusBadge tone={tone} label={label} dot />;
}
