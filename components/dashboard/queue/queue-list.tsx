"use client";

import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QueueDepartment, QueueEntry } from "@/lib/types/queue";
import { LiveDuration } from "@/components/dashboard/queue/live-duration";
import { PriorityBadge, SourceBadge } from "@/components/dashboard/queue/queue-badges";

export function QueueList({
  entries,
  departments,
  showDepartment,
  onCall,
  onSkip,
  isLoading,
  isMutating,
}: {
  entries: QueueEntry[];
  departments: QueueDepartment[];
  showDepartment: boolean;
  onCall: (entry: QueueEntry) => void;
  onSkip: (entry: QueueEntry) => void;
  isLoading: boolean;
  isMutating: boolean;
}) {
  const deptName = (id: string) =>
    departments.find((d) => d.id === id)?.name ?? id;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between p-5">
        <h2 className="text-base font-bold text-fg">Waiting</h2>
        <span className="text-sm text-fg-muted">
          {entries.length} in queue
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-px">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="h-5 w-14 animate-pulse rounded bg-surface-muted" />
              <div className="h-5 flex-1 animate-pulse rounded bg-surface-muted" />
              <div className="h-5 w-20 animate-pulse rounded bg-surface-muted" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="border-t border-border py-12 text-center text-sm text-fg-muted">
          The queue is empty.
        </div>
      ) : (
        <ul className="border-t border-border">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className="flex items-center gap-4 border-b border-border px-5 py-3.5 last:border-0"
            >
              <span className="w-6 text-sm font-medium text-fg-placeholder">
                {index + 1}
              </span>

              <span className="w-16 text-sm font-bold tracking-tight text-fg">
                {entry.ticketNumber}
              </span>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-fg">
                  {entry.patientName}
                </span>
                <div className="flex items-center gap-2">
                  {showDepartment && (
                    <span className="text-xs text-fg-muted">
                      {deptName(entry.departmentId)}
                    </span>
                  )}
                  <SourceBadge source={entry.source} />
                </div>
              </div>

              <PriorityBadge priority={entry.priority} />

              <LiveDuration
                since={entry.checkInAt}
                className="w-20 text-right text-sm font-medium tabular-nums text-fg-secondary"
              />

              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  onClick={() => onCall(entry)}
                  disabled={isMutating}
                >
                  <Phone className="size-3.5" />
                  Call
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSkip(entry)}
                  disabled={isMutating}
                >
                  Skip
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}