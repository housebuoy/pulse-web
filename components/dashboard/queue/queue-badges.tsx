import { CalendarCheck, Footprints } from "lucide-react";
import type { PatientSource, QueuePriority } from "@/lib/types/queue";
import { StatusBadge, type BadgeTone } from "@/components/dashboard/status-badge";

const priorityTone: Record<QueuePriority, BadgeTone> = {
  emergency: "danger",
  urgent: "warning",
  routine: "neutral",
};

const priorityLabel: Record<QueuePriority, string> = {
  emergency: "Emergency",
  urgent: "Urgent",
  routine: "Routine",
};

export function PriorityBadge({ priority }: { priority: QueuePriority }) {
  return (
    <StatusBadge tone={priorityTone[priority]} label={priorityLabel[priority]} />
  );
}

export function SourceBadge({ source }: { source: PatientSource }) {
  const isAppt = source === "appointment";
  const Icon = isAppt ? CalendarCheck : Footprints;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
      <Icon className="size-3.5" />
      {isAppt ? "Appointment" : "Walk-in"}
    </span>
  );
}
