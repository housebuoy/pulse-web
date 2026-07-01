"use client";

import { StatBar } from "@/components/dashboard/shared/stat-bar";

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
    <StatBar
      tiles={[
        { label: "Waiting", value: waiting },
        { label: "In consultation", value: serving },
        { label: "Longest wait", value: longestWait, unit: "m" },
      ]}
      live="5s"
    />
  );
}
