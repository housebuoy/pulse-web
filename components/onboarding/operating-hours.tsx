"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleChips } from "@/components/ui/toggle-chips";
import {DAYS, TIMES} from "@/lib/constants";



const fmt = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export interface OperatingHoursValue {
  days: string[];
  open: string;
  close: string;
}

interface OperatingHoursProps {
  value: OperatingHoursValue;
  onChange: (next: OperatingHoursValue) => void;
}

export function OperatingHours({ value, onChange }: OperatingHoursProps) {
  return (
    <div className="space-y-3">
      <ToggleChips
        options={DAYS}
        value={value.days}
        onChange={(days) => onChange({ ...value, days })}
      />

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <span className="text-body-sm text-fg-muted">Opens</span>
          <Select value={value.open} onValueChange={(v) => onChange({ ...value, open: v })}>
            <SelectTrigger className="h-12 rounded-sm border-border bg-surface text-body">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {TIMES.map((t) => <SelectItem key={t} value={t}>{fmt(t)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <span className="text-body-sm text-fg-muted">Closes</span>
          <Select value={value.close} onValueChange={(v) => onChange({ ...value, close: v })}>
            <SelectTrigger className="h-12 rounded-sm border-border bg-surface text-body">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {TIMES.map((t) => <SelectItem key={t} value={t}>{fmt(t)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}