"use client";

import { CalendarX2, CircleAlert, Clock, TriangleAlert } from "lucide-react";
import type { AlertSeverity } from "@/lib/types/dashboard";
import { useDashboardAlerts } from "@/hooks/use-dashboard";
import { cn } from "@/lib/utils";

const severityConfig: Record<
  AlertSeverity,
  { tint: string; icon: typeof CircleAlert; iconColor: string }
> = {
  critical: { tint: "bg-danger/8", icon: CircleAlert, iconColor: "text-danger" },
  warning: { tint: "bg-warning/10", icon: Clock, iconColor: "text-warning" },
  info: { tint: "bg-surface-muted", icon: CalendarX2, iconColor: "text-fg-muted" },
};

export function NeedsAttentionCard() {
  const { data: alerts = [], isLoading } = useDashboardAlerts();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <TriangleAlert className="size-[18px] text-warning" />
        <h2 className="text-base font-bold text-fg">Needs Attention</h2>
      </div>

      {isLoading
        ? Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-lg bg-surface-muted"
            />
          ))
        : alerts.map((alert) => {
            const { tint, icon: Icon, iconColor } = severityConfig[alert.severity];
            return (
              <div
                key={alert.id}
                className={cn("flex items-center gap-3 rounded-lg p-3", tint)}
              >
                <Icon className={cn("size-4 shrink-0", iconColor)} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-fg">
                    {alert.title}
                  </span>
                  <span className="text-xs text-fg-muted">
                    {alert.description}
                  </span>
                </div>
              </div>
            );
          })}
    </div>
  );
}