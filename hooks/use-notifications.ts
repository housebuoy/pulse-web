import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as notificationsApi from "@/lib/api/notifications";

const keys = {
  all: ["notifications"] as const,
  list: () => [...keys.all, "list"] as const,
  unread: () => [...keys.all, "unread"] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: keys.list(),
    queryFn: notificationsApi.fetchNotifications,
    // Poll at 30 s — real app will switch to SSE; hook stays the single point.
    refetchInterval: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: keys.unread(),
    queryFn: notificationsApi.fetchUnreadCount,
    refetchInterval: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
