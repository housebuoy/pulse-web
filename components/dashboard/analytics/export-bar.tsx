"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildCsv, downloadCsv } from "@/lib/analytics-utils";
import type { DailyMetric } from "@/lib/types/analytics";

const HEADERS = [
  "Date",
  "Patient volume",
  "Appointments",
  "Walk-ins",
  "Avg wait (min)",
  "P90 wait (min)",
  "Served",
  "No-shows",
  "No-show rate (%)",
];

function toRows(daily: DailyMetric[]) {
  return daily.map((d) => [
    d.date,
    d.patientVolume,
    d.appointments,
    d.walkIns,
    d.avgWaitMinutes,
    d.p90WaitMinutes,
    d.served,
    d.noShows,
    d.noShowRate.toFixed(1),
  ]);
}

export function ExportBar({
  daily,
  filenamePrefix,
}: {
  daily: DailyMetric[];
  filenamePrefix: string;
}) {
  const handleExportCsv = () => {
    const csv = buildCsv(HEADERS, toRows(daily));
    downloadCsv(`${filenamePrefix}.csv`, csv);
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button size="sm" variant="outline" onClick={handleExportCsv}>
        <Download className="size-4" />
        Export CSV
      </Button>
      <Button size="sm" variant="outline" onClick={() => window.print()}>
        <Printer className="size-4" />
        Print / Save as PDF
      </Button>
    </div>
  );
}
