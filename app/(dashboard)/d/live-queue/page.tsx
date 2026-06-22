"use client";

import { useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { QueueDepartmentTabs } from "@/components/dashboard/queue/queue-department-tabs";
import { QueueSummary } from "@/components/dashboard/queue/queue-summary";
import { NowServingPanel } from "@/components/dashboard/queue/now-serving-panel";
import { QueueList } from "@/components/dashboard/queue/queue-list";
import {
  useCallNext,
  useQueueDepartments,
  useQueueEntries,
  useUpdateQueueStatus,
} from "@/hooks/use-queue";
import type { QueueEntry } from "@/lib/types/queue";
import { compareWaiting, minutesSince } from "@/lib/queue-utils";

export default function LiveQueuePage() {
  const [department, setDepartment] = useState("all");

  const { data: departments = [] } = useQueueDepartments();
  const { data: entries = [], isLoading } = useQueueEntries(department);

  const callNext = useCallNext();
  const updateStatus = useUpdateQueueStatus();

  const serving = useMemo(
    () => entries.filter((e) => e.status === "in_consultation"),
    [entries],
  );
  const waiting = useMemo(
    () => entries.filter((e) => e.status === "waiting").sort(compareWaiting),
    [entries],
  );

  const longestWait = waiting.reduce(
    (max, e) => Math.max(max, minutesSince(e.checkInAt)),
    0,
  );

  const isAllView = department === "all";
  const isMutating = callNext.isPending || updateStatus.isPending;

  const handleCall = (entry: QueueEntry) =>
    callNext.mutate({ departmentId: entry.departmentId, entryId: entry.id });

  return (
    <>
      <DashboardHeader title="Live Queue" />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col gap-6">
          <QueueDepartmentTabs
            departments={departments}
            value={department}
            onChange={setDepartment}
          />

          <QueueSummary
            waiting={waiting.length}
            serving={serving.length}
            longestWait={longestWait}
          />

          <NowServingPanel
            serving={serving}
            canCallNext={!isAllView && waiting.length > 0}
            onCallNext={() => callNext.mutate({ departmentId: department })}
            onComplete={(entry) =>
              updateStatus.mutate({ entryId: entry.id, status: "completed" })
            }
            onNoShow={(entry) =>
              updateStatus.mutate({ entryId: entry.id, status: "no_show" })
            }
            isCalling={callNext.isPending}
            isUpdating={updateStatus.isPending}
          />

          <QueueList
            entries={waiting}
            departments={departments}
            showDepartment={isAllView}
            onCall={handleCall}
            onSkip={(entry) =>
              updateStatus.mutate({ entryId: entry.id, status: "skipped" })
            }
            isLoading={isLoading}
            isMutating={isMutating}
          />
        </div>
      </div>
    </>
  );
}