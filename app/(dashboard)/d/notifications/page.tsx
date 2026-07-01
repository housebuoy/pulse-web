"use client";

import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ListOrdered,
  Stethoscope,
  UserX,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
} from "@/hooks/use-notifications";
import type { NotificationType } from "@/lib/types/notifications";

// ---- shared helpers (mirrors notifications-panel.tsx) ----------------------

function relativeTime(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

const TYPE_META: Record<
  NotificationType,
  { icon: LucideIcon; bg: string; fg: string }
> = {
  queue: { icon: ListOrdered, bg: "bg-warning/10", fg: "text-warning" },
  no_show: { icon: UserX, bg: "bg-danger/10", fg: "text-danger" },
  appointment: { icon: CalendarDays, bg: "bg-brand/10", fg: "text-brand" },
  staff: { icon: Stethoscope, bg: "bg-surface-muted", fg: "text-fg-secondary" },
  summary: { icon: BarChart3, bg: "bg-surface-muted", fg: "text-fg-secondary" },
  system: { icon: Bell, bg: "bg-surface-muted", fg: "text-fg-secondary" },
};

// ---- page ------------------------------------------------------------------

export default function NotificationsPage() {
  const router = useRouter();
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleItemClick = (id: string, link?: string | null) => {
    markRead.mutate(id);
    if (link) router.push(link);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="Notifications" />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-2xl">
          {/* Toolbar */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-fg-muted">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "All caught up"}
            </p>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* List */}
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            {isLoading && notifications.length === 0 ? (
              <div className="space-y-px p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-muted" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center text-sm text-fg-muted">
                No notifications yet.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((n) => {
                  const { icon: Icon, bg, fg } = TYPE_META[n.type];
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleItemClick(n.id, n.link)}
                        className={cn(
                          "flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-subtle",
                          !n.read && "bg-brand/[0.03]",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                            bg,
                          )}
                        >
                          <Icon className={cn("size-4", fg)} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-sm leading-snug",
                              n.read
                                ? "font-normal text-fg-secondary"
                                : "font-medium text-fg",
                            )}
                          >
                            {n.title}
                          </span>
                          {n.body && (
                            <span className="block text-sm text-fg-muted">
                              {n.body}
                            </span>
                          )}
                          <span className="block text-xs text-fg-placeholder">
                            {relativeTime(n.createdAt)}
                          </span>
                        </span>

                        {!n.read && (
                          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
