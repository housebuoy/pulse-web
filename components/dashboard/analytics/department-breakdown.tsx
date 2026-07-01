"use client";

import { ClipboardCheck, Gauge, Timer, UserX, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SingleSelect } from "@/components/ui/single-select";
import {
  StatCard,
  StatCardSkeleton,
} from "@/components/dashboard/overview/stat-card";
import { ChartCard } from "./chart-card";
import { AnalyticsLineChart } from "./analytics-line-chart";
import { ExportBar } from "./export-bar";
import { computeDelta } from "@/lib/analytics-utils";
import type {
  DailyMetric,
  FacilityAnalytics,
} from "@/lib/types/analytics";
import type { StatMetric } from "@/lib/types/dashboard";

const ICONS: Record<string, LucideIcon> = {
  volume: Users,
  wait: Timer,
  served: ClipboardCheck,
  "no-show": UserX,
  utilization: Gauge,
};

function mergeOverlay(
  deptDaily: DailyMetric[],
  facilityDaily: DailyMetric[],
  field: keyof DailyMetric,
  divisor: number,
): { date: string; department: number; facility: number }[] {
  const byDate = new Map(facilityDaily.map((d) => [d.date, d]));
  return deptDaily.map((d) => ({
    date: d.date,
    department: d[field] as number,
    facility: ((byDate.get(d.date)?.[field] as number) ?? 0) / divisor,
  }));
}

export function DepartmentBreakdown({
  data,
  isLoading,
  departmentOptions,
  selectedId,
  onSelect,
}: {
  data: FacilityAnalytics | undefined;
  isLoading: boolean;
  departmentOptions: { id: string; name: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected = data?.departments.find((d) => d.departmentId === selectedId);
  const departmentCount = data?.departments.length || 1;
  // Narrows both together so the JSX below never needs a `data!` assertion.
  const ready = data && selected ? { data, selected } : null;

  const metrics: StatMetric[] = (() => {
    if (!selected) return [];
    const t = selected.totals;
    const p = selected.previousTotals;
    return [
      {
        id: "volume",
        label: "Patient volume",
        value: String(t.patientVolume),
        trend: computeDelta(t.patientVolume, p.patientVolume, "up"),
      },
      {
        id: "wait",
        label: "Avg wait",
        value: String(t.avgWaitMinutes),
        unit: "m",
        trend: computeDelta(t.avgWaitMinutes, p.avgWaitMinutes, "down"),
      },
      {
        id: "served",
        label: "Served",
        value: String(t.served),
        trend: computeDelta(t.served, p.served, "up"),
      },
      {
        id: "no-show",
        label: "No-show rate",
        value: t.noShowRate.toFixed(1),
        unit: "%",
        trend: computeDelta(t.noShowRate, p.noShowRate, "down"),
      },
      {
        id: "utilization",
        label: "Utilization",
        value: String(selected.utilization),
        unit: "%",
        trend: {
          direction: "up",
          label: `${selected.capacityPerDay}/day capacity`,
          sentiment: "neutral",
        },
      },
    ];
  })();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-64">
          <SingleSelect
            value={selectedId}
            onChange={onSelect}
            options={departmentOptions.map((d) => ({
              label: d.name,
              value: d.id,
            }))}
            placeholder="Select department"
            searchPlaceholder="Search departments…"
            emptyText="No departments found."
          />
        </div>
        {selected && data && (
          <ExportBar
            daily={selected.daily}
            filenamePrefix={`pulse-analytics-${selected.departmentName
              .toLowerCase()
              .replace(/\s+/g, "-")}-${data.range.from}_to_${data.range.to}`}
          />
        )}
      </div>

      {isLoading && !ready ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : !ready ? (
        <p className="text-sm text-fg-muted">
          No analytics data for this department in the selected range yet.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map((m) => (
              <StatCard
                key={m.id}
                metric={m}
                icon={ICONS[m.id] ?? Users}
              />
            ))}
          </div>

          <ChartCard
            title={`${ready.selected.departmentName} — patient volume vs. facility average`}
          >
            <AnalyticsLineChart
              data={mergeOverlay(
                ready.selected.daily,
                ready.data.daily,
                "patientVolume",
                departmentCount,
              )}
              series={[
                {
                  key: "department",
                  name: ready.selected.departmentName,
                  color: "var(--color-brand)",
                },
                {
                  key: "facility",
                  name: "Facility average / dept",
                  color: "var(--color-fg-placeholder)",
                  dashed: true,
                },
              ]}
            />
          </ChartCard>

          <ChartCard
            title={`${ready.selected.departmentName} — avg wait vs. facility average`}
          >
            <AnalyticsLineChart
              data={mergeOverlay(
                ready.selected.daily,
                ready.data.daily,
                "avgWaitMinutes",
                1,
              )}
              series={[
                {
                  key: "department",
                  name: ready.selected.departmentName,
                  color: "var(--color-brand)",
                },
                {
                  key: "facility",
                  name: "Facility average",
                  color: "var(--color-fg-placeholder)",
                  dashed: true,
                },
              ]}
              valueSuffix="m"
            />
          </ChartCard>

          <ChartCard
            title={`${ready.selected.departmentName} — no-show rate vs. facility average`}
          >
            <AnalyticsLineChart
              data={mergeOverlay(ready.selected.daily, ready.data.daily, "noShowRate", 1)}
              series={[
                {
                  key: "department",
                  name: ready.selected.departmentName,
                  color: "var(--color-danger)",
                },
                {
                  key: "facility",
                  name: "Facility average",
                  color: "var(--color-fg-placeholder)",
                  dashed: true,
                },
              ]}
              valueSuffix="%"
            />
          </ChartCard>
        </>
      )}
    </div>
  );
}
