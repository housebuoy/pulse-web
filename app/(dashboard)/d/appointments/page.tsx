"use client";

import { useMemo, useState } from "react";
// ⚠️ Verify this import + prop against your existing live-queue page.
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AppointmentDateNav } from "@/components/dashboard/appointments/appointment-date-nav";
import { AppointmentFilters } from "@/components/dashboard/appointments/appointment-filters";
import { AppointmentSummary } from "@/components/dashboard/appointments/appointment-summary";
import { AppointmentList } from "@/components/dashboard/appointments/appointment-list";
import {
  useAppointments,
  useAppointmentDepartments,
  useAppointmentStats,
  useUpdateAppointment,
} from "@/hooks/use-appointments";
import { countByDepartment, toDateKey } from "@/lib/appointment-utils";
import type { AppointmentStatus } from "@/lib/types/appointments";

export default function AppointmentsPage() {
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const [departmentId, setDepartmentId] = useState<string>("all");
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");

  // Fetch the whole day once; filter by department/status client-side so the
  // tab counts stay accurate and switching tabs is instant. The API still
  // accepts those filters for when the backend wants to do it server-side.
  const { data: all = [], isLoading } = useAppointments({ date });
  const { data: stats } = useAppointmentStats(date);
  const { data: departments = [] } = useAppointmentDepartments();
  const update = useUpdateAppointment();

  const deptCounts = useMemo(() => countByDepartment(all), [all]);

  const visible = useMemo(
    () =>
      all.filter(
        (a) =>
          (departmentId === "all" || a.departmentId === departmentId) &&
          (status === "all" || a.status === status)
      ),
    [all, departmentId, status]
  );

  const handleAction = (id: string, next: AppointmentStatus) =>
    update.mutate({ id, status: next });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="Appointments" />

      {/* Own scroll region — the dashboard layout clips the main area, so each
          page scrolls its own content (same wrapper as the Live Queue page). */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6 p-6">
          <AppointmentDateNav date={date} onChange={setDate} />

          <AppointmentFilters
            departments={departments}
            departmentId={departmentId}
            onDepartmentChange={setDepartmentId}
            status={status}
            onStatusChange={setStatus}
            total={all.length}
            counts={deptCounts}
          />

          <AppointmentSummary stats={stats} isLoading={isLoading} />

          <AppointmentList
            appointments={visible}
            isLoading={isLoading}
            isMutating={update.isPending}
            onAction={handleAction}
          />
        </div>
      </div>
    </div>
  );
}