"use client";

import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QueueEntry } from "@/lib/types/queue";
import { LiveDuration } from "@/components/dashboard/queue/live-duration";

export function NowServingPanel({
  serving,
  canCallNext,
  onCallNext,
  onComplete,
  onNoShow,
  isCalling,
  isUpdating,
}: {
  serving: QueueEntry[];
  canCallNext: boolean;
  onCallNext: () => void;
  onComplete: (entry: QueueEntry) => void;
  onNoShow: (entry: QueueEntry) => void;
  isCalling: boolean;
  isUpdating: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-fg">Now Serving</h2>
        {canCallNext && (
          <Button size="sm" onClick={onCallNext} disabled={isCalling}>
            <Phone className="size-4" />
            {isCalling ? "Calling…" : "Call next"}
          </Button>
        )}
      </div>

      {serving.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-fg-muted">
          No one in consultation. Call the next patient to begin.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {serving.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold tracking-tight text-brand">
                    {entry.ticketNumber}
                  </div>
                  <div className="text-sm font-medium text-fg">
                    {entry.patientName}
                  </div>
                </div>
                <div className="text-right text-xs text-fg-muted">
                  <div>{entry.room}</div>
                  <div>{entry.clinician}</div>
                </div>
              </div>

              <div className="text-xs text-fg-muted">
                In consultation{" "}
                {entry.calledAt && (
                  <LiveDuration
                    since={entry.calledAt}
                    className="font-medium text-fg-secondary"
                  />
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onComplete(entry)}
                  disabled={isUpdating}
                >
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onNoShow(entry)}
                  disabled={isUpdating}
                >
                  No-show
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}