"use client";

import { useMemo, useRef, useState } from "react";
import { ClipboardCheck, Timer, UserX, Users, type LucideIcon } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  StatCard,
  StatCardSkeleton,
} from "@/components/dashboard/overview/stat-card";
import { ChartCard } from "@/components/dashboard/analytics/chart-card";
import { AnalyticsLineChart } from "@/components/dashboard/analytics/analytics-line-chart";
import { AnalyticsDateRangePicker } from "@/components/dashboard/analytics/date-range-picker";
import { ExportBar } from "@/components/dashboard/analytics/export-bar";
import { StatusBreakdown } from "@/components/dashboard/analytics/status-breakdown";
import { DepartmentComparisonTable } from "@/components/dashboard/analytics/department-comparison-table";
import { DepartmentBreakdown } from "@/components/dashboard/analytics/department-breakdown";
import { useAnalytics } from "@/hooks/use-analytics";
import { useDepartments } from "@/hooks/use-departments";
import { computeDelta, presetToRange, type RangePreset } from "@/lib/analytics-utils";
import { formatRangeLabel } from "@/lib/format";
import type { DateRange } from "@/lib/types/analytics";
import type { StatMetric } from "@/lib/types/dashboard";

const KPI_ICONS: Record<string, LucideIcon> = {
  volume: Users,
  wait: Timer,
  served: ClipboardCheck,
  "no-show": UserX,
};

export default function AnalyticsPage() {
  const [preset, setPreset] = useState<RangePreset>("30d");
  const [range, setRange] = useState<DateRange>(() => presetToRange("30d"));
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const breakdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useAnalytics(range);
  const { data: allDepartments = [] } = useDepartments();

  const departmentOptions = useMemo(
    () =>
      allDepartments
        .filter((d) => d.status !== "archived")
        .map((d) => ({ id: d.id, name: d.name })),
    [allDepartments],
  );

  const activeDepartmentId =
    selectedDepartmentId ||
    data?.departments[0]?.departmentId ||
    departmentOptions[0]?.id ||
    "";

  const handleSelectDepartment = (id: string) => {
    setSelectedDepartmentId(id);
    breakdownRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const metrics = useMemo<StatMetric[]>(() => {
    if (!data) return [];
    const t = data.totals;
    const p = data.previousTotals;
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
    ];
  }, [data]);

  return (
    <>
      <DashboardHeader title="Analytics" />

      <div className="flex-1 overflow-y-auto p-8 print:overflow-visible">
        <div className="flex flex-col gap-6">
          {/* print-only header — the interactive controls below are hidden when printing */}
          <p className="hidden text-sm text-fg-muted print:block">
            Pulse Health — Analytics — {formatRangeLabel(range.from, range.to)}
          </p>

          {/* controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <AnalyticsDateRangePicker
              range={range}
              preset={preset}
              onChange={(nextRange, nextPreset) => {
                setRange(nextRange);
                setPreset(nextPreset);
              }}
            />
            {data && (
              <ExportBar
                daily={data.daily}
                filenamePrefix={`pulse-analytics-facility-${range.from}_to_${range.to}`}
              />
            )}
          </div>

          {/* ───────── Facility overview ───────── */}
          <div>
            <h1 className="mb-4 text-lg font-bold text-fg">Facility overview</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {isLoading && !data
                ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                : metrics.map((m) => (
                    <StatCard key={m.id} metric={m} icon={KPI_ICONS[m.id] ?? Users} />
                  ))}
            </div>
          </div>

          <ChartCard title="Patient volume">
            {isLoading && !data ? (
              <div className="h-[260px] animate-pulse rounded-lg bg-surface-muted" />
            ) : (
              <AnalyticsLineChart
                data={data?.daily ?? []}
                series={[
                  { key: "patientVolume", name: "Patient volume", color: "var(--color-brand)" },
                ]}
              />
            )}
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Wait time">
              {isLoading && !data ? (
                <div className="h-[260px] animate-pulse rounded-lg bg-surface-muted" />
              ) : (
                <AnalyticsLineChart
                  data={data?.daily ?? []}
                  series={[
                    { key: "avgWaitMinutes", name: "Avg wait", color: "var(--color-brand)" },
                    { key: "p90WaitMinutes", name: "P90 wait", color: "var(--color-warning)" },
                  ]}
                  valueSuffix="m"
                />
              )}
            </ChartCard>

            <ChartCard title="No-show rate">
              {isLoading && !data ? (
                <div className="h-[260px] animate-pulse rounded-lg bg-surface-muted" />
              ) : (
                <AnalyticsLineChart
                  data={data?.daily ?? []}
                  series={[
                    { key: "noShowRate", name: "No-show rate", color: "var(--color-danger)" },
                  ]}
                  valueSuffix="%"
                />
              )}
            </ChartCard>
          </div>

          <ChartCard title="Appointments by status">
            {isLoading && !data ? (
              <div className="h-[140px] animate-pulse rounded-lg bg-surface-muted" />
            ) : (
              <StatusBreakdown data={data?.appointmentsByStatus ?? []} />
            )}
          </ChartCard>

          <div>
            <h2 className="mb-4 text-base font-bold text-fg">
              Department comparison
            </h2>
            {isLoading && !data ? (
              <div className="h-[220px] animate-pulse rounded-2xl bg-surface-muted" />
            ) : (
              <DepartmentComparisonTable
                departments={data?.departments ?? []}
                onSelectDepartment={handleSelectDepartment}
              />
            )}
          </div>

          {/* ───────── Per-department breakdown ───────── */}
          <div ref={breakdownRef} className="flex flex-col gap-4 border-t border-border pt-6">
            <h1 className="text-lg font-bold text-fg">Department breakdown</h1>
            <DepartmentBreakdown
              data={data}
              isLoading={isLoading}
              departmentOptions={departmentOptions}
              selectedId={activeDepartmentId}
              onSelect={setSelectedDepartmentId}
            />
          </div>
        </div>
      </div>
    </>
  );
}
