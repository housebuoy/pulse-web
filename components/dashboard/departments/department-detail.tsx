"use client";

import Link from "next/link";
import {
  Building2,
  CalendarDays,
  Clock,
  DoorOpen,
  ListOrdered,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DepartmentStatusBadge } from "@/components/dashboard/departments/department-status-badge";
import { DepartmentActionsMenu } from "@/components/dashboard/departments/department-actions-menu";
import { StaffStatusBadge } from "@/components/dashboard/staff/staff-status-badge";
import { UserAvatar } from "@/components/dashboard/shared/user-avatar";
import { useStaff } from "@/hooks/use-staff";
import { useUpdateDepartment } from "@/hooks/use-departments";
import { formatHours, loadTone, type LoadTone } from "@/lib/department-utils";
import { cn } from "@/lib/utils";
import type { Department } from "@/lib/types/departments";

// ---- local stat cell (part of the flat divided strip) ---------------------

const LOAD_TEXT: Record<LoadTone, string> = {
  success: "text-fg",
  warning: "text-warning",
  danger: "text-danger",
};

function StatCell({
  value,
  label,
  tone,
}: {
  value: string | number;
  label: string;
  tone?: LoadTone;
}) {
  return (
    <div className="px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-[17px] font-bold tabular-nums",
          tone ? LOAD_TEXT[tone] : "text-fg",
        )}
      >
        {value}
      </div>
    </div>
  );
}

// ---- component ---------------------------------------------------------------

export function DepartmentDetail({
  department,
  onRemoved,
}: {
  department: Department;
  onRemoved: () => void;
}) {
  const isActive = department.status === "active";
  const update = useUpdateDepartment();
  const { data: staff = [] } = useStaff();
  const departmentStaff = staff.filter(
    (s) => s.departmentId === department.id,
  );

  return (
    // One panel — sections separated by hairline border-t, no inner card borders.
    <div className="flex-1 overflow-y-auto">
      {/* ── header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold text-fg">{department.name}</h1>
              <DepartmentStatusBadge status={department.status} />
            </div>
            <p className="text-xs text-fg-muted">
              {department.code} · Head: {department.headDoctorName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/d/departments/${department.id}/edit`}>
              <Pencil className="size-3.5" />
              Edit
            </Link>
          </Button>
          <Button
            size="sm"
            variant={isActive ? "outline" : "default"}
            disabled={update.isPending}
            onClick={() =>
              update.mutate({
                id: department.id,
                status: isActive ? "closed" : "active",
              })
            }
          >
            {isActive ? "Close" : "Open"}
          </Button>
          <DepartmentActionsMenu department={department} onRemoved={onRemoved} />
        </div>
      </div>

      {/* ── stat strip ─────────────────────────────────── */}
      <div className="flex divide-x divide-border border-t border-border">
        <StatCell
          value={department.waiting}
          label="Waiting"
          tone={isActive ? loadTone(department.waiting) : "success"}
        />
        <StatCell value={department.inConsultation} label="Serving" />
        <StatCell value={`${department.avgWaitMinutes}m`} label="Avg wait" />
        <StatCell
          value={`${department.doctorsOnDuty}/${department.totalDoctors}`}
          label="Doctors"
        />
        <StatCell value={department.rooms} label="Rooms" />
        <StatCell value={department.appointmentsToday} label="Appts" />
      </div>

      {/* ── hours + compact quick links ────────────────── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-5 py-2.5 text-xs text-fg-muted">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5 shrink-0" />
          {formatHours(department)}
        </span>
        <span className="inline-flex items-center gap-1">
          <DoorOpen className="size-3.5 shrink-0" />
          {department.rooms} rooms
        </span>
        <span className="ml-1 inline-flex items-center gap-3">
          <Link
            href={`/d/live-queue?department=${department.id}`}
            className="inline-flex items-center gap-1 font-medium text-brand transition-colors hover:underline"
          >
            <ListOrdered className="size-3.5" />
            Live queue
          </Link>
          <Link
            href={`/d/appointments?department=${department.id}`}
            className="inline-flex items-center gap-1 font-medium text-brand transition-colors hover:underline"
          >
            <CalendarDays className="size-3.5" />
            Appointments
          </Link>
        </span>
      </div>

      {/* ── staff ──────────────────────────────────────── */}
      <div className="border-t border-border">
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-sm font-bold text-fg">Staff</h2>
          <span className="text-xs text-fg-muted">
            {departmentStaff.length} people
          </span>
        </div>
        {departmentStaff.length === 0 ? (
          <div className="border-t border-border px-5 py-8 text-center text-sm text-fg-muted">
            No staff assigned yet.
          </div>
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {departmentStaff.map((member) => (
              <li key={member.id}>
                <Link
                  href={`/d/staff/${member.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-subtle"
                >
                  <UserAvatar
                    name={member.name}
                    avatarUrl={member.avatarUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-fg">
                      {member.name}
                    </div>
                    <div className="truncate text-xs text-fg-muted">
                      {member.title}
                    </div>
                  </div>
                  <StaffStatusBadge status={member.dutyStatus} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
