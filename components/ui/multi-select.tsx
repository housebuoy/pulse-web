"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allowCustom?: boolean;
  id?: string;
  className?: string;
}

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = "Click to add…",
  searchPlaceholder = "Search…",
  emptyText = "No results found.",
  allowCustom = false,
  id,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const customRef = useRef<HTMLInputElement>(null);

  const toggle = (item: string) =>
    onChange(value.includes(item) ? value.filter((x) => x !== item) : [...value, item]);
  const remove = (item: string) => onChange(value.filter((x) => x !== item));

  const startCustom = () => {
    setOpen(false);
    setCustomMode(true);
    setCustomValue("");
  };
  const cancelCustom = () => {
    setCustomMode(false);
    setCustomValue("");
  };
  const confirmCustom = () => {
    const v = customValue.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    cancelCustom();
  };

  useEffect(() => {
    if (customMode) customRef.current?.focus();
  }, [customMode]);

  const onCustomKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); confirmCustom(); }
    else if (e.key === "Escape") { e.preventDefault(); cancelCustom(); }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div
            id={id}
            onClick={() => { if (!customMode) setOpen(true); }}
            className="flex w-full flex-wrap items-center gap-2 rounded-sm border border-border bg-surface p-2 shadow-input transition-colors focus-within:border-brand"
          >
            {/* + now uses button-style corners */}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand text-white">
              <Plus className="h-4 w-4" />
            </span>

            {value.map((item) => (
              <span key={item}
                className="flex items-center gap-1.5 rounded-sm bg-surface-muted px-2 py-1 text-body-sm text-fg-secondary">
                {item}
                <button type="button" onClick={(e) => { e.stopPropagation(); remove(item); }}
                  className="text-fg-muted hover:text-fg">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}

            {customMode ? (
              <input
                ref={customRef}
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={onCustomKey}
                placeholder="Type a department…"
                className="min-w-[140px] flex-1 bg-transparent text-body text-fg placeholder:text-fg-placeholder focus:outline-none"
              />
            ) : (
              value.length === 0 && (
                <span className="text-body text-fg-placeholder">{placeholder}</span>
              )
            )}
          </div>
        </PopoverAnchor>

        <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0 shadow-popover">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              className="text-fg placeholder:text-fg-placeholder"
            />
            <CommandList className="max-h-50 overflow-y-auto">
              <CommandEmpty className="px-2 py-3 text-body-sm text-fg-muted">{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((item) => (
                  <CommandItem key={item} value={item} onSelect={() => toggle(item)}>
                    <Check className={cn("mr-2 h-4 w-4 text-brand", value.includes(item) ? "opacity-100" : "opacity-0")} />
                    {item}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>

            {allowCustom && (
              <div className="border-t border-border p-1">
                <button
                  type="button"
                  onClick={startCustom}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-body-sm text-brand hover:bg-surface-muted"
                >
                  <Plus className="h-4 w-4" />
                  Other
                </button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {customMode && (
        <p className="text-caption text-fg-muted">
          Press <kbd className="font-medium text-fg-secondary">Enter</kbd> to confirm or{" "}
          <kbd className="font-medium text-fg-secondary">Esc</kbd> to cancel
        </p>
      )}
    </div>
  );
}