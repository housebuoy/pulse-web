"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  RANGE_PRESET_LABEL,
  presetToRange,
  toDateKey,
  type RangePreset,
} from "@/lib/analytics-utils";
import { formatRangeLabel } from "@/lib/format";
import type { DateRange } from "@/lib/types/analytics";

const PRESETS: Exclude<RangePreset, "custom">[] = ["today", "7d", "30d", "90d"];

export function AnalyticsDateRangePicker({
  range,
  preset,
  onChange,
}: {
  range: DateRange;
  preset: RangePreset;
  onChange: (range: DateRange, preset: RangePreset) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = {
    from: new Date(`${range.from}T00:00:00`),
    to: new Date(`${range.to}T00:00:00`),
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={preset === p ? "default" : "outline"}
          onClick={() => onChange(presetToRange(p), p)}
        >
          {RANGE_PRESET_LABEL[p]}
        </Button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant={preset === "custom" ? "default" : "outline"}
            className="gap-1.5"
          >
            <CalendarIcon className="size-3.5" />
            {preset === "custom"
              ? formatRangeLabel(range.from, range.to)
              : "Custom"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            className="text-fg"
            selected={selected}
            onSelect={(next?: { from?: Date; to?: Date }) => {
              if (next?.from && next?.to) {
                onChange(
                  { from: toDateKey(next.from), to: toDateKey(next.to) },
                  "custom",
                );
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
