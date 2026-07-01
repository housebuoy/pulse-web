"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SettingsTabs, type SettingsTab } from "@/components/dashboard/settings/settings-tabs";
import { FacilitySection } from "@/components/dashboard/settings/facility-section";
import { ProfileSection } from "@/components/dashboard/settings/profile-section";
import { OperationalSection } from "@/components/dashboard/settings/operational-section";
import { TeamAccessSection } from "@/components/dashboard/settings/team-access-section";

const VALID_TABS = new Set<SettingsTab>(["facility", "profile", "operational", "team"]);

function SettingsBody() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get("tab") ?? "";
  const tab: SettingsTab = VALID_TABS.has(raw as SettingsTab)
    ? (raw as SettingsTab)
    : "facility";

  const handleTabChange = (next: SettingsTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.push(`${pathname}?${params}`, { scroll: false });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex flex-col gap-6">
        <SettingsTabs value={tab} onChange={handleTabChange} />

        <div className={tab === "team" ? "" : "mx-auto w-full max-w-3xl"}>
          {tab === "facility" && <FacilitySection />}
          {tab === "profile" && <ProfileSection />}
          {tab === "operational" && <OperationalSection />}
          {tab === "team" && <TeamAccessSection />}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader title="Settings" />
      <Suspense fallback={<div className="flex-1" />}>
        <SettingsBody />
      </Suspense>
    </>
  );
}
