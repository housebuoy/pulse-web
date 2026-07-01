"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatChartDate } from "@/lib/analytics-utils";

const axisTick = { fontSize: 12, fill: "var(--color-fg-placeholder)" };

export interface AnalyticsLineSeries {
  key: string;
  name: string;
  color: string; // theme CSS var, e.g. "var(--color-brand)"
  dashed?: boolean;
}

// Generic (not Record<string, ...>) so concrete shapes like DailyMetric —
// which have no index signature — can be passed straight through.
export function AnalyticsLineChart<T extends { date: string }>({
  data,
  series,
  height = 260,
  valueSuffix = "",
}: {
  data: T[];
  series: AnalyticsLineSeries[];
  height?: number;
  valueSuffix?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="0" />
        <XAxis
          dataKey="date"
          tickFormatter={(v: string) => formatChartDate(v)}
          tickLine={false}
          axisLine={false}
          tick={axisTick}
          dy={8}
          minTickGap={24}
        />
        <YAxis tickLine={false} axisLine={false} tick={axisTick} width={36} />
        <Tooltip
          labelFormatter={(label) => formatChartDate(String(label))}
          formatter={(value, name) => {
            const num = typeof value === "number" ? value : Number(value);
            const rounded = Math.round(num * 10) / 10;
            return [`${rounded}${valueSuffix}`, String(name)];
          }}
          cursor={{ stroke: "var(--color-border)" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            fontSize: 13,
            fontFamily: "var(--font-sans)",
          }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            strokeDasharray={s.dashed ? "5 4" : undefined}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
