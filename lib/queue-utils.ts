import type { QueueEntry, QueuePriority } from "@/lib/types/queue";

// Higher = served sooner.
export const priorityRank: Record<QueuePriority, number> = {
  emergency: 3,
  urgent: 2,
  routine: 1,
};

/** Queue order: priority first, then longest-waiting (earliest check-in). */
export function compareWaiting(a: QueueEntry, b: QueueEntry): number {
  if (priorityRank[b.priority] !== priorityRank[a.priority]) {
    return priorityRank[b.priority] - priorityRank[a.priority];
  }
  return new Date(a.checkInAt).getTime() - new Date(b.checkInAt).getTime();
}

export function minutesSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
}