"use client";

import { useMemo, useState } from "react";
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

export default function WorkspaceAppointmentsPage() {
  const session = useWorkspaceSession();
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const [view, setView] = useAppointmentView();
  const update = useUpdateAppointment();

  // List: single-day fetch scoped to this doctor.
  const { data: all = [], isLoading } = useAppointments({ date });
  const mine = useMemo(
    () => all.filter((a) => a.doctorName === session.name),
    [all, session.name],
  );

  // Week / month: range fetch scoped to this doctor.
  const weekRange = useMemo(() => getWeekRange(date), [date]);
  const monthRange = useMemo(() => getMonthRange(date), [date]);

  const { data: weekAll = [], isLoading: weekLoading } = useAppointmentsRange(
    weekRange.from,
    weekRange.to,
  );
  const { data: monthAll = [], isLoading: monthLoading } = useAppointmentsRange(
    monthRange.from,
    monthRange.to,
  );

  const weekMine = useMemo(
    () => weekAll.filter((a) => a.doctorName === session.name),
    [weekAll, session.name],
  );
  const monthMine = useMemo(
    () => monthAll.filter((a) => a.doctorName === session.name),
    [monthAll, session.name],
  );

  const handleAction = (id: string, next: AppointmentStatus) =>
    update.mutate({ id, status: next });

  const scheduled = mine.filter((a) => a.status === "scheduled").length;
  const confirmed = mine.filter((a) => a.status === "confirmed").length;
  const checkedIn = mine.filter((a) => a.status === "checked_in").length;
  const completed = mine.filter((a) => a.status === "completed").length;
  const noShow = mine.filter((a) => a.status === "no_show").length;

  return (
    <>
      <DashboardHeader title="My Appointments" />

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
            isLoading={isLoading}
          />

          {view === "list" && (
            <AppointmentList
              appointments={mine}
              isLoading={isLoading}
              isMutating={update.isPending}
              onAction={handleAction}
            />
          )}

          {view === "week" && (
            <WeekView
              appointments={weekMine}
              date={date}
              isLoading={weekLoading}
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
    </>
  );
}
