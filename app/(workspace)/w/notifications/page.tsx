"use client";

// Doctor notifications page — same shared feed as /d/notifications (web#11).
// The backend feed is owner-scoped and role-agnostic, so this is purely the
// doctor-side surface for the same bell data.

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { NotificationsFeed } from "@/components/dashboard/notifications/notifications-feed";

export default function WorkspaceNotificationsPage() {
  return (
    <>
      <DashboardHeader title="Notifications" />
      <NotificationsFeed />
    </>
  );
}
