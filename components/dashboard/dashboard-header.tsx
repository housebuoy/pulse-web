"use client";

import { Suspense } from "react";
import { formatLongDate } from "@/lib/format";
import { NotificationsPanel } from "@/components/dashboard/notifications/notifications-panel";
import { HelpMenu } from "@/components/dashboard/notifications/help-menu";
import {
  GlobalSearch,
  GlobalSearchFallback,
} from "@/components/dashboard/global-search";

export function DashboardHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-4 print:hidden">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold tracking-tight text-fg">{title}</h1>
        <p className="text-[13px] text-fg-muted">{formatLongDate(new Date())}</p>
      </div>

      <div className="flex items-center gap-3">
        <Suspense fallback={<GlobalSearchFallback />}>
          <GlobalSearch />
        </Suspense>
        <NotificationsPanel />
        <HelpMenu />
      </div>
    </header>
  );
}
