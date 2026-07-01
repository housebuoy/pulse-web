"use client";

import { cn } from "@/lib/utils";

export type SettingsTab = "facility" | "profile" | "operational" | "team";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "facility", label: "Facility" },
  { id: "profile", label: "Profile & Account" },
  { id: "operational", label: "Operational" },
  { id: "team", label: "Team & Access" },
];

export function SettingsTabs({
  value,
  onChange,
}: {
  value: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}) {
  return (
    <div className="inline-flex w-fit items-center gap-1 rounded-md bg-surface-muted p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-sm px-4 py-1.5 text-sm font-medium transition-colors",
            value === tab.id
              ? "bg-surface text-fg shadow-input"
              : "text-fg-muted hover:text-fg-secondary",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
