// Swap point. USE_MOCK true → resolves from lib/mock/notifications.
// Flip the flag and the same functions hit Spring Boot (polling or SSE later).
// The hook is the single integration point — components never call this file.

import { api } from "@/lib/axios"; // ⚠️ match your lib/api/queue.ts import exactly
import * as mock from "@/lib/mock/notifications";
import type { Notification } from "@/lib/types/notifications";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export async function fetchNotifications(): Promise<Notification[]> {
  if (USE_MOCK) return mock.listNotifications();
  const { data } = await api.get<Notification[]>("/notifications");
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  if (USE_MOCK) return mock.getUnreadCount();
  const { data } = await api.get<{ count: number }>("/notifications/unread-count");
  return data.count;
}

export async function markRead(id: string): Promise<Notification[]> {
  if (USE_MOCK) return mock.markRead(id);
  const { data } = await api.patch<Notification[]>(`/notifications/${id}/read`);
  return data;
}

export async function markAllRead(): Promise<Notification[]> {
  if (USE_MOCK) return mock.markAllRead();
  const { data } = await api.post<Notification[]>("/notifications/read-all");
  return data;
}
