"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { usePatientVolume } from "@/hooks/use-dashboard";

const axisTick = { fontSize: 12, fill: "var(--color-fg-placeholder)" };

export function PatientVolumeChart() {
  const { data = [], isLoading } = usePatientVolume();

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="mb-5 text-base font-bold text-fg">Patient Volume Today</h2>

      {isLoading ? (
        <div className="h-[260px] animate-pulse rounded-lg bg-surface-muted" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid
              vertical={false}
              stroke="var(--color-border)"
              strokeDasharray="0"
            />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={axisTick}
              width={28}
            />
            <Tooltip
              cursor={{ fill: "var(--color-surface-muted)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                fontSize: 13,
                fontFamily: "var(--font-sans)",
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            <Bar
              dataKey="walkIns"
              name="Walk-ins"
              stackId="vol"
              fill="var(--color-brand)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="appointments"
              name="Appointments"
              stackId="vol"
              fill="var(--color-brand)"
              fillOpacity={0.35}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}