import { StatusBadge } from "@/components/dashboard/status-badge";
import { DEPT_STATUS_META } from "@/lib/department-utils";
import type { DepartmentStatus } from "@/lib/types/departments";

export function DepartmentStatusBadge({
  status,
}: {
  status: DepartmentStatus;
}) {
  const { label, tone } = DEPT_STATUS_META[status];
  return <StatusBadge tone={tone} label={label} dot />;
}
