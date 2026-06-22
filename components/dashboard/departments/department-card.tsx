"use client";

import { Building2, Clock, DoorOpen, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DepartmentStatusBadge } from "./department-status-badge";
import { formatHours, loadTone, type LoadTone } from "@/lib/department-utils";
import type { Department, DepartmentStatus } from "@/lib/types/departments";

const LOAD_TEXT: Record<LoadTone, string> = {
  success: "text-fg",
  warning: "text-warning",
  danger: "text-danger",
};

function Stat({
  value,
  label,
  tone,
}: {
  value: string | number;
  label: string;
  tone?: LoadTone;
}) {
  return (
    <div>
      <div
        className={cn(
          "text-lg font-bold tabular-nums",
          tone ? LOAD_TEXT[tone] : "text-fg",
        )}
      >
        {value}
      </div>
      <div className="text-xs text-fg-muted">{label}</div>
    </div>
  );
}

export function DepartmentCard({
  department,
  onToggle,
  isMutating,
}: {
  department: Department;
  onToggle: (id: string, next: DepartmentStatus) => void;
  isMutating: boolean;
}) {
  const isActive = department.status === "active";

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-fg">{department.name}</div>
            <div className="text-xs text-fg-muted">
              {department.code} · Head: {department.headDoctorName}
            </div>
          </div>
        </div>
        <DepartmentStatusBadge status={department.status} />
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        <Stat
          value={department.waiting}
          label="Waiting"
          tone={isActive ? loadTone(department.waiting) : "success"}
        />
        <Stat value={department.inConsultation} label="Serving" />
        <Stat value={`${department.avgWaitMinutes}m`} label="Avg wait" />
        <Stat
          value={`${department.doctorsOnDuty}/${department.totalDoctors}`}
          label="Doctors"
        />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatHours(department)}
          </span>
          <span className="inline-flex items-center gap-1">
            <DoorOpen className="h-3.5 w-3.5" />
            {department.rooms} rooms
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {department.appointmentsToday} appts
          </span>
        </div>

        <Button
          size="sm"
          variant={isActive ? "outline" : "default"}
          disabled={isMutating}
          onClick={() =>
            onToggle(department.id, isActive ? "closed" : "active")
          }
        >
          {isActive ? "Close" : "Open"}
        </Button>
      </div>
    </div>
  );
}
