"use client";

// Admin notifications page — shared feed component (web#11).

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NotificationsFeed } from "@/components/dashboard/notifications/notifications-feed";

export default function NotificationsPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="Notifications" />
      <NotificationsFeed />
    </div>
  );
}
