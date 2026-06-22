"use client";

import { LiveStatusIndicator } from "@/components/dashboard/live-status-indicator";
import { MetricStat } from "@/components/dashboard/metric-stat";

export function QueueSummary({
  waiting,
  serving,
  longestWait,
}: {
  waiting: number;
  serving: number;
  longestWait: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm">
      <div className="flex gap-8">
        <MetricStat label="Waiting" value={waiting} />
        <MetricStat label="In consultation" value={serving} />
        <MetricStat label="Longest wait" value={`${longestWait}m`} />
      </div>
      <LiveStatusIndicator interval="5s" />
    </div>
  );
}
