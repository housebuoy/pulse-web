"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  value: string[];
  id?: string;
  onChange: (next: string[]) => void;
  options: string[];
  placeholder?: string;        // resting trigger text
  searchPlaceholder?: string;
  emptyText?: string;
  allowCustom?: boolean;       // let users add free-text entries
  className?: string;
}

export function MultiSelect({
  value,
  id,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results found.",
  allowCustom = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const toggle = (item: string) =>
    onChange(value.includes(item) ? value.filter((x) => x !== item) : [...value, item]);
  const remove = (item: string) => onChange(value.filter((x) => x !== item));

  const trimmed = query.trim();
  const canCreate =
    allowCustom &&
    trimmed.length > 0 &&
    ![...options, ...value].some((o) => o.toLowerCase() === trimmed.toLowerCase());
  const addCustom = () => {
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setQuery("");
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            className="flex w-full items-center gap-3 rounded-sm border border-border bg-surface p-3 text-left transition-colors hover:border-fg-placeholder"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-body text-fg-placeholder">{placeholder}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0 shadow-popover">
          <Command>
            <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
            <CommandList>
              <CommandEmpty>
                {canCreate ? (
                  <button type="button" onClick={addCustom}
                    className="w-full px-2 py-1.5 text-left text-body-sm text-brand">
                    Add “{trimmed}”
                  </button>
                ) : (
                  <span className="text-body-sm text-fg-muted">{emptyText}</span>
                )}
              </CommandEmpty>
              <CommandGroup>
                {options.map((item) => (
                  <CommandItem key={item} value={item} onSelect={() => toggle(item)}>
                    <Check className={cn("mr-2 h-4 w-4 text-brand", value.includes(item) ? "opacity-100" : "opacity-0")} />
                    {item}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <span key={item}
              className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1 text-body-sm text-fg-secondary">
              {item}
              <button type="button" onClick={() => remove(item)} className="text-fg-muted hover:text-fg">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}