// Queue API. Mock today; flip NEXT_PUBLIC_USE_MOCK="false" to hit Spring Boot.
// The mutating calls (call-next, status) are shaped as the real endpoints.

import { api } from "@/lib/axios";
import {
  delay,
  listEntries,
  setStatus,
  promoteNext,
  buildDepartments,
} from "@/lib/mock/queue";
import type {
  QueueDepartment,
  QueueEntry,
  CallNextInput,
  UpdateStatusInput,
} from "@/lib/types/queue";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

// Active = the only statuses shown on the board.
const isActive = (e: QueueEntry) =>
  e.status === "waiting" || e.status === "in_consultation";

export async function getQueueDepartments(): Promise<QueueDepartment[]> {
  if (USE_MOCK) {
    await delay();
    return buildDepartments(listEntries());
  }
  const { data } = await api.get<QueueDepartment[]>("/queue/departments");
  return data;
}

export async function getQueueEntries(
  departmentId = "all",
): Promise<QueueEntry[]> {
  if (USE_MOCK) {
    await delay();
    const active = listEntries().filter(isActive);
    return departmentId === "all"
      ? active
      : active.filter((e) => e.departmentId === departmentId);
  }
  const { data } = await api.get<QueueEntry[]>("/queue/entries", {
    params: departmentId === "all" ? undefined : { departmentId },
  });
  return data;
}

export async function callNextPatient(input: CallNextInput): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    promoteNext(input.departmentId, input.entryId);
    return;
  }
  await api.post("/queue/call-next", input);
}

export async function updateQueueEntryStatus(
  input: UpdateStatusInput,
): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    setStatus(input.entryId, input.status);
    return;
  }
  await api.patch(`/queue/entries/${input.entryId}`, { status: input.status });
}