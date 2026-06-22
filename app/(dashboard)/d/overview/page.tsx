"use client";

import {
  CalendarCheck,
  Timer,
  UserX,
  Users,
  type LucideIcon,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  StatCard,
  StatCardSkeleton,
} from "@/components/dashboard/overview/stat-card";
import { LiveQueueCard } from "@/components/dashboard/overview/live-queue-card";
import { NeedsAttentionCard } from "@/components/dashboard/overview/needs-attention-card";
import { PatientVolumeChart } from "@/components/dashboard/overview/patient-volume-chart";
import { useDashboardStats } from "@/hooks/use-dashboard";

// Icons are a UI concern, not data — map them to metric ids here.
const statIcons: Record<string, LucideIcon> = {
  "patients-in-queue": Users,
  "avg-wait-time": Timer,
  "appointments-today": CalendarCheck,
  "no-show-rate": UserX,
};

export default function OverviewPage() {
  const { data: stats = [], isLoading } = useDashboardStats();

  return (
    <>
      <DashboardHeader title="Overview" />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col gap-6">
          {/* stat cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))
              : stats.map((metric) => (
                  <StatCard
                    key={metric.id}
                    metric={metric}
                    icon={statIcons[metric.id] ?? Users}
                  />
                ))}
          </div>

          {/* queue + attention */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <LiveQueueCard />
            </div>
            <NeedsAttentionCard />
          </div>

          {/* volume chart */}
          <PatientVolumeChart />
        </div>
      </div>
    </>
  );
}
