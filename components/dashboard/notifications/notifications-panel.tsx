"use client";

import { useState } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from "@/hooks/use-notifications";
import type { NotificationType } from "@/lib/types/notifications";

// ---- helpers ----------------------------------------------------------------

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

// ---- panel ------------------------------------------------------------------

export function NotificationsPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"all" | "unread">("all");

  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const visible =
    view === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const newItems = visible.filter((n) => !n.read);
  const earlierItems = visible.filter((n) => n.read);

  const handleItemClick = (id: string, link?: string | null) => {
    markRead.mutate(id);
    if (link) {
      setOpen(false);
      router.push(link);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          className="relative flex size-[38px] items-center justify-center rounded-full border border-border bg-surface-subtle text-fg-secondary transition-colors hover:bg-surface-muted"
        >
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex min-w-3.5 items-center justify-center rounded-full bg-danger px-1  py-0.5 text-[9px] font-bold leading-none text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] gap-0 p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-fg">Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="text-xs font-medium text-brand transition-colors hover:underline disabled:opacity-50"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* All / Unread toggle */}
        <div className="flex border-b border-border px-4 py-2">
          <div className="inline-flex items-center gap-1 rounded-md bg-surface-muted p-0.5">
            {(["all", "unread"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "rounded-sm px-3 py-1 text-xs font-medium transition-colors",
                  view === v
                    ? "bg-surface text-fg shadow-input"
                    : "text-fg-muted hover:text-fg-secondary",
                )}
              >
                {v === "all" ? "All" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-muted" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-fg-muted">
              {view === "unread" ? "No unread notifications." : "No notifications."}
            </div>
          ) : (
            <>
              {newItems.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
                    New
                  </p>
                  {newItems.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onClick={() => handleItemClick(n.id, n.link)}
                    />
                  ))}
                </div>
              )}
              {earlierItems.length > 0 && (
                <div>
                  {newItems.length > 0 && (
                    <div className="border-t border-border" />
                  )}
                  <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
                    Earlier
                  </p>
                  {earlierItems.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onClick={() => handleItemClick(n.id, n.link)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2.5">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-center text-xs"
          >
            <a
              href="/d/notifications"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---- row -------------------------------------------------------------------

function NotificationRow({
  notification: n,
  onClick,
}: {
  notification: import("@/lib/types/notifications").Notification;
  onClick: () => void;
}) {
  const { icon: Icon, bg, fg } = TYPE_META[n.type];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-subtle",
        !n.read && "bg-brand/[0.03]",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg",
          bg,
        )}
      >
        <Icon className={cn("size-3.5", fg)} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-sm leading-snug",
            n.read ? "font-normal text-fg-secondary" : "font-medium text-fg",
          )}
        >
          {n.title}
        </span>
        {n.body && (
          <span className="block truncate text-xs text-fg-muted">
            {n.body}
          </span>
        )}
        <span className="block text-[11px] text-fg-placeholder">
          {relativeTime(n.createdAt)}
        </span>
      </span>

      {!n.read && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />
      )}
    </button>
  );
}
