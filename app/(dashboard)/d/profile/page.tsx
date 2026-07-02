"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ProfileSection } from "@/components/dashboard/settings/profile-section";

// Personal account page — same ProfileSection component as Settings → Profile
// tab, but reached directly from the sidebar user card in both /d and /w.
export default function AdminProfilePage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="Profile & Account" />
      <div className="min-h-0 flex-1 overflow-y-auto p-8">
        <div className="mx-auto w-full max-w-3xl">
          <ProfileSection />
        </div>
      </div>
    </div>
  );
}
