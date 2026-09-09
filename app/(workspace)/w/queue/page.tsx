"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Phone,
  Stethoscope,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatBar } from "@/components/dashboard/shared/stat-bar";
import { NowServingPanel } from "@/components/dashboard/queue/now-serving-panel";
import { QueueList } from "@/components/dashboard/queue/queue-list";
import {
  useCallNext,
  useQueueDepartments,
  useQueueEntries,
  useUpdateQueueStatus,
} from "@/hooks/use-queue";
import { useAppointments } from "@/hooks/use-appointments";
import { useWorkspaceSession } from "@/hooks/use-workspace-session";
import { compareWaiting, minutesSince } from "@/lib/queue-utils";
import { toDateKey } from "@/lib/appointment-utils";
import type { QueueEntry } from "@/lib/types/queue";

export default function WorkspaceQueuePage() {
  const session = useWorkspaceSession();
  const today = toDateKey(new Date());

  // Queue — scoped to the doctor's department; all entries fetched once.
  const { data: departments = [] } = useQueueDepartments();
  const entriesQuery = useQueueEntries(session.departmentId);
  const allEntries = entriesQuery.data ?? [];

  // Today's appointments for the "My Day" stat bar — server-scoped to this
  // clinician via staffId (stable identity; renames don't orphan the list).
  const myApptsQuery = useAppointments({
    date: today,
    staffId: session.staffId,
  });
  const myAppts = myApptsQuery.data ?? [];

  // Latch — empty states (Now Serving / waiting list) must not flash from
  // stale cache while a remount refetch is in flight; shimmer instead until
  // both queries have been idle for a beat (see My Patients page, same bug).
  const [dataSettled, setDataSettled] = useState(false);
  const resolving = entriesQuery.isPending || myApptsQuery.isPending;
  const fetching = entriesQuery.isFetching || myApptsQuery.isFetching;
  useEffect(() => {
    if (resolving || fetching) return;
    const t = setTimeout(() => setDataSettled(true), 250);
    return () => clearTimeout(t);
  }, [resolving, fetching]);
  const isLoading = entriesQuery.isLoading;
  const seen = myAppts.filter((a) => a.status === "completed").length;

  const callNext = useCallNext();
  const updateStatus = useUpdateQueueStatus();

  // In consultation — only entries this doctor has called. Identity join on
  // the stable clinicianId (name fallback for rows without one yet).
  const serving = useMemo(
    () =>
      allEntries.filter(
        (e) =>
          e.status === "in_consultation" &&
          (e.clinicianId
            ? e.clinicianId === session.staffId
            : e.clinician === session.name),
      ),
    [allEntries, session.staffId, session.name],
  );

  // Waiting list — full department queue (doctor can call any).
  const waiting = useMemo(
    () =>
      allEntries
        .filter((e) => e.status === "waiting")
        .sort(compareWaiting),
    [allEntries],
  );

  const longestWait = waiting.reduce(
    (max, e) => Math.max(max, minutesSince(e.checkInAt)),
    0,
  );

  const isMutating = callNext.isPending || updateStatus.isPending;

  const handleCall = (entry: QueueEntry) =>
    callNext.mutate({
      departmentId: entry.departmentId,
      entryId: entry.id,
    });

  return (
    <>
      <DashboardHeader title="My Queue" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-6">
          {/* My Day — at-a-glance numbers for this doctor's shift */}
          <StatBar
            tiles={[
              {
                label: "Appts today",
                value: myAppts.length,
                icon: CalendarDays,
              },
              {
                label: "Patients seen",
                value: seen,
                icon: CheckCircle2,
              },
              {
                label: "Now serving",
                value: serving.length,
                icon: Stethoscope,
              },
              {
                label: "Waiting",
                value: waiting.length,
                icon: Phone,
              },
              {
                label: "Longest wait",
                value: longestWait,
                unit: "m",
              },
            ]}
            isLoading={isLoading}
            live="5s"
          />

          {/* Now Serving — only this doctor's active patients */}
          <NowServingPanel
            serving={serving}
            canCallNext={waiting.length > 0}
            onCallNext={() =>
              callNext.mutate({ departmentId: session.departmentId })
            }
            isCalling={callNext.isPending}
            isUpdating={updateStatus.isPending}
            isLoading={isLoading || (!dataSettled && serving.length === 0)}
          />

          {/* Department waiting list — all patients the doctor can call next */}
          <QueueList
            entries={waiting}
            departments={departments}
            showDepartment={false}
            onCall={handleCall}
            onSkip={(entry) =>
              updateStatus.mutate({ entryId: entry.id, status: "skipped" })
            }
            isLoading={isLoading || (!dataSettled && waiting.length === 0)}
            isMutating={isMutating}
          />
        </div>
      </div>
    </>
  );
}
