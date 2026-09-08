"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AppointmentDateNav } from "@/components/dashboard/appointments/appointment-date-nav";
import { AppointmentList } from "@/components/dashboard/appointments/appointment-list";
import { StatBar } from "@/components/dashboard/shared/stat-bar";
import { WeekView } from "@/components/dashboard/appointments/week-view";
import { MonthView } from "@/components/dashboard/appointments/month-view";
import {
  ViewSwitcher,
  useAppointmentView,
} from "@/components/dashboard/appointments/view-switcher";
import {
  useAppointments,
  useAppointmentsRange,
  useUpdateAppointment,
} from "@/hooks/use-appointments";
import { useWorkspaceSession } from "@/hooks/use-workspace-session";
import { toDateKey } from "@/lib/appointment-utils";
import { getWeekRange, getMonthRange } from "@/lib/calendar-utils";
import type { AppointmentStatus } from "@/lib/types/appointments";

function AppointmentsBody() {
  const searchParams = useSearchParams();
  const session = useWorkspaceSession();
  const [date, setDate] = useState(
    () => searchParams.get("date") ?? toDateKey(new Date()),
  );
  const [view, setView] = useAppointmentView();
  const update = useUpdateAppointment();

  // Server-scoped to this clinician via the stable staffId (email-linked to
  // the legacy doctor) — a profile rename never orphans the schedule.
  const listQuery = useAppointments({
    date,
    staffId: session.staffId,
  });
  const mine = listQuery.data ?? [];

  // Week / month: range fetch scoped to this doctor.
  const weekRange = useMemo(() => getWeekRange(date), [date]);
  const monthRange = useMemo(() => getMonthRange(date), [date]);

  const weekQuery = useAppointmentsRange(weekRange.from, weekRange.to, {
    staffId: session.staffId,
  });
  const monthQuery = useAppointmentsRange(monthRange.from, monthRange.to, {
    staffId: session.staffId,
  });
  const weekMine = weekQuery.data ?? [];
  const monthMine = monthQuery.data ?? [];
  const weekLoading = weekQuery.isLoading;
  const monthLoading = monthQuery.isLoading;

  // Latch — empty views must not flash from stale cache while a remount
  // refetch is in flight; shimmer instead until the queries settle (same
  // pattern as My Patients / My Queue).
  const [dataSettled, setDataSettled] = useState(false);
  const resolving =
    listQuery.isPending || weekQuery.isPending || monthQuery.isPending;
  const fetching =
    listQuery.isFetching || weekQuery.isFetching || monthQuery.isFetching;
  useEffect(() => {
    if (resolving || fetching) return;
    const t = setTimeout(() => setDataSettled(true), 250);
    return () => clearTimeout(t);
  }, [resolving, fetching]);
  const isLoading = listQuery.isLoading;

  const handleAction = (id: string, next: AppointmentStatus) =>
    update.mutate({ id, status: next });

  const scheduled = mine.filter((a) => a.status === "scheduled").length;
  const confirmed = mine.filter((a) => a.status === "confirmed").length;
  const checkedIn = mine.filter((a) => a.status === "checked_in").length;
  const completed = mine.filter((a) => a.status === "completed").length;
  const noShow = mine.filter((a) => a.status === "no_show").length;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AppointmentDateNav date={date} onChange={setDate} view={view} />
          <ViewSwitcher view={view} onChange={setView} />
        </div>

        <StatBar
          tiles={[
            { label: "Total", value: mine.length },
            { label: "Scheduled", value: scheduled },
            { label: "Confirmed", value: confirmed },
            { label: "Checked in", value: checkedIn },
            { label: "Completed", value: completed },
            { label: "No-show", value: noShow },
          ]}
          isLoading={isLoading || (!dataSettled && mine.length === 0)}
        />

        {view === "list" && (
          <AppointmentList
            appointments={mine}
            isLoading={isLoading || (!dataSettled && mine.length === 0)}
            isMutating={update.isPending}
            onAction={handleAction}
          />
        )}

        {view === "week" && (
          <WeekView
            appointments={weekMine}
            date={date}
            isLoading={weekLoading || (!dataSettled && weekMine.length === 0)}
            isMutating={update.isPending}
            onAction={handleAction}
          />
        )}

        {view === "month" && (
          <MonthView
            appointments={monthMine}
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

export default function WorkspaceAppointmentsPage() {
  return (
    <>
      <DashboardHeader title="My Appointments" />
      <Suspense fallback={<div className="min-h-0 flex-1" />}>
        <AppointmentsBody />
      </Suspense>
    </>
  );
}
