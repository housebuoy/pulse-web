"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface SingleSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
}

export function SingleSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
}: SingleSelectProps) {
  const [open, setOpen] = useState(false);

  // Find the selected option to display its label
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-md border border-input bg-surface-subtle px-4 py-2 text-body transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
            !selectedOption && "text-fg-placeholder",
            className
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronDown className="h-4 w-4 shrink-0 text-fg-muted" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 shadow-popover" align="start">
        <Command>
          <CommandInput 
            placeholder={searchPlaceholder} 
            className="text-fg placeholder:text-fg-placeholder" 
          />
          <CommandList className="max-h-[200px] overflow-y-auto">
            <CommandEmpty className="px-2 py-3 text-body-sm text-fg-muted">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Search against the readable label
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false); // Close the menu after selection
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-brand",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}