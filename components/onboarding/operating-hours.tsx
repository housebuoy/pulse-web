"use client";

import { Plus, X } from "lucide-react";
import { SingleSelect } from "@/components/ui/single-select";
import { ToggleChips } from "@/components/ui/toggle-chips";
import { DAYS, TIMES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const fmt = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const TIME_OPTIONS = TIMES.map((t) => ({ label: fmt(t), value: t }));

export interface ScheduleBlock {
  id: string;
  days: string[];
  open: string;
  close: string;
}
export interface OperatingHoursValue {
  alwaysOpen: boolean;
  schedules: ScheduleBlock[];
}

const newBlock = (): ScheduleBlock => ({
  id: crypto.randomUUID(),
  days: [],
  open: "08:00",
  close: "17:00",
});

interface OperatingHoursProps {
  value: OperatingHoursValue;
  onChange: (next: OperatingHoursValue) => void;
}

export function OperatingHours({ value, onChange }: OperatingHoursProps) {
  const setAlwaysOpen = (alwaysOpen: boolean) => onChange({ ...value, alwaysOpen });
  const updateBlock = (id: string, patch: Partial<ScheduleBlock>) =>
    onChange({
      ...value,
      schedules: value.schedules.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });
  const addBlock = () => onChange({ ...value, schedules: [...value.schedules, newBlock()] });
  const removeBlock = (id: string) =>
    onChange({ ...value, schedules: value.schedules.filter((b) => b.id !== id) });

  return (
    <div className="mt-3 space-y-4 rounded-md border border-border bg-surface p-5">
      {/* Mode tabs */}
      <div className="flex w-fit gap-1 rounded-md bg-surface-muted p-1">
        {[
          { label: "Set hours", on: !value.alwaysOpen, action: () => setAlwaysOpen(false) },
          { label: "Open 24/7", on: value.alwaysOpen, action: () => setAlwaysOpen(true) },
        ].map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={tab.action}
            className={cn(
              "rounded-sm px-4 py-1.5 text-body-sm transition-colors",
              tab.on ? "bg-surface text-fg shadow-input" : "text-fg-muted hover:text-fg-secondary",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {value.alwaysOpen && (
        <p className="text-body-sm text-fg-muted">
          Open around the clock — day and time settings are paused.
        </p>
      )}

      {/* Schedule editor — dimmed & inert while 24/7 is on */}
      <div
        aria-disabled={value.alwaysOpen}
        className={cn("space-y-4", value.alwaysOpen && "pointer-events-none select-none opacity-50")}
      >
        {value.schedules.map((block, i) => (
          <div key={block.id} className="space-y-3 rounded-sm border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-medium text-fg-secondary">
                {i === 0 ? "Hours" : "Additional hours"}
              </span>
              {value.schedules.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="flex items-center gap-1 text-caption text-fg-muted hover:text-fg"
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>

            <ToggleChips
              options={DAYS}
              value={block.days}
              onChange={(days) => updateBlock(block.id, { days })}
            />

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <span className="text-body-sm font-medium text-fg-secondary">Opens</span>
                <SingleSelect
                  value={block.open}
                  onChange={(v) => updateBlock(block.id, { open: v })}
                  options={TIME_OPTIONS}
                  placeholder="Select time"
                  searchPlaceholder="Search time…"
                  emptyText="No times found."
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-body-sm font-medium text-fg-secondary">Closes</span>
                <SingleSelect
                  value={block.close}
                  onChange={(v) => updateBlock(block.id, { close: v })}
                  options={TIME_OPTIONS}
                  placeholder="Select time"
                  searchPlaceholder="Search time…"
                  emptyText="No times found."
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addBlock}
          className="flex items-center gap-2 text-body-sm font-medium text-brand hover:underline"
        >
          <Plus className="h-4 w-4" /> Add hours for other days
        </button>
      </div>
    </div>
  );
}