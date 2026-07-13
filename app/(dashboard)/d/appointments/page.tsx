"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AppointmentDateNav } from "@/components/dashboard/appointments/appointment-date-nav";
import { AppointmentFilters } from "@/components/dashboard/appointments/appointment-filters";
import { AppointmentSummary } from "@/components/dashboard/appointments/appointment-summary";
import { AppointmentList } from "@/components/dashboard/appointments/appointment-list";
import { WeekView } from "@/components/dashboard/appointments/week-view";
import { MonthView } from "@/components/dashboard/appointments/month-view";
import {
  ViewSwitcher,
  useAppointmentView,
} from "@/components/dashboard/appointments/view-switcher";
import {
  useAppointments,
  useAppointmentDepartments,
  useAppointmentStats,
  useAppointmentsRange,
  useUpdateAppointment,
} from "@/hooks/use-appointments";
import { countByDepartment, toDateKey } from "@/lib/appointment-utils";
import { getWeekRange, getMonthRange } from "@/lib/calendar-utils";
import type { AppointmentStatus } from "@/lib/types/appointments";

function AppointmentsBody() {
  const searchParams = useSearchParams();
  const [date, setDate] = useState(
    () => searchParams.get("date") ?? toDateKey(new Date()),
  );
  const [departmentId, setDepartmentId] = useState<string>(
    () => searchParams.get("department") ?? "all",
  );
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [view, setView] = useAppointmentView();

  // List view: single-day fetch (unchanged behaviour).
  const { data: dayAppts = [], isLoading: dayLoading } = useAppointments({
    date,
  });
  const { data: stats } = useAppointmentStats(date);
  const { data: departments = [] } = useAppointmentDepartments();
  const update = useUpdateAppointment();

  // Week / month views: range fetch. Both hooks always run; only one is used.
  const weekRange = useMemo(() => getWeekRange(date), [date]);
  const monthRange = useMemo(() => getMonthRange(date), [date]);

  const { data: weekAppts = [], isLoading: weekLoading } = useAppointmentsRange(
    weekRange.from,
    weekRange.to,
  );
  const { data: monthAppts = [], isLoading: monthLoading } =
    useAppointmentsRange(monthRange.from, monthRange.to);

  // Shared department + status filters — applied identically across List,
  // Week, and Month so switching views never changes what's "in scope".
  const deptCounts = useMemo(() => countByDepartment(dayAppts), [dayAppts]);
  const matchesFilter = useCallback(
    (a: { departmentId: string; status: AppointmentStatus }) =>
      (departmentId === "all" || a.departmentId === departmentId) &&
      (status === "all" || a.status === status),
    [departmentId, status],
  );
  const visibleDay = useMemo(
    () => dayAppts.filter(matchesFilter),
    [dayAppts, matchesFilter],
  );
  const visibleWeek = useMemo(
    () => weekAppts.filter(matchesFilter),
    [weekAppts, matchesFilter],
  );
  const visibleMonth = useMemo(
    () => monthAppts.filter(matchesFilter),
    [monthAppts, matchesFilter],
  );

  const handleAction = (id: string, next: AppointmentStatus) =>
    update.mutate({ id, status: next });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AppointmentDateNav date={date} onChange={setDate} view={view} />
          <ViewSwitcher view={view} onChange={setView} />
        </div>

        <AppointmentFilters
          departments={departments}
          departmentId={departmentId}
          onDepartmentChange={setDepartmentId}
          status={status}
          onStatusChange={setStatus}
          total={dayAppts.length}
          counts={deptCounts}
        />
        <AppointmentSummary stats={stats} isLoading={dayLoading} />

        {view === "list" && (
          <AppointmentList
            appointments={visibleDay}
            isLoading={dayLoading}
            isMutating={update.isPending}
            onAction={handleAction}
          />
        )}

        {view === "week" && (
          <WeekView
            appointments={visibleWeek}
            date={date}
            isLoading={weekLoading}
            isMutating={update.isPending}
            onAction={handleAction}
          />
        )}

        {view === "month" && (
          <MonthView
            appointments={visibleMonth}
            date={date}
            isLoading={monthLoading}
            isMutating={update.isPending}
            onAction={handleAction}
          />
        )}
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="Appointments" />
      <Suspense fallback={<div className="min-h-0 flex-1" />}>
        <AppointmentsBody />
      </Suspense>
    </div>
  );
}
