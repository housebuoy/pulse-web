"use client";

import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AppointmentDateNav } from "@/components/dashboard/appointments/appointment-date-nav";
import { AppointmentList } from "@/components/dashboard/appointments/appointment-list";
import { StatBar } from "@/components/dashboard/shared/stat-bar";
import { useAppointments, useUpdateAppointment } from "@/hooks/use-appointments";
import { useWorkspaceSession } from "@/hooks/use-workspace-session";
import { toDateKey } from "@/lib/appointment-utils";
import type { AppointmentStatus } from "@/lib/types/appointments";

export default function WorkspaceAppointmentsPage() {
  const session = useWorkspaceSession();
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const { data: all = [], isLoading } = useAppointments({ date });
  const update = useUpdateAppointment();

  // Scope: only this doctor's appointments.
  const mine = useMemo(
    () => all.filter((a) => a.doctorName === session.name),
    [all, session.name],
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
          <AppointmentDateNav date={date} onChange={setDate} />

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

          <AppointmentList
            appointments={mine}
            isLoading={isLoading}
            isMutating={update.isPending}
            onAction={handleAction}
          />
        </div>
      </div>
    </>
  );
}
