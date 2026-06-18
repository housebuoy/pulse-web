"use client";

import { cn } from "@/lib/utils";

interface ToggleChipsProps {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  className?: string;
}

export function ToggleChips({ options, value, onChange, className }: ToggleChipsProps) {
  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const on = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(opt)}
            className={cn(
              "h-9 min-w-[52px] rounded-md px-3 text-body-sm transition-colors",
              on
                ? "bg-brand text-white"
                : "border border-border bg-surface text-fg-secondary hover:border-fg-placeholder",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}