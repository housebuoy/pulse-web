"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SECTIONS: { heading: string; shortcuts: { keys: string[]; label: string }[] }[] = [
  {
    heading: "Navigation",
    shortcuts: [
      { keys: ["G", "Q"], label: "Go to Live Queue" },
      { keys: ["G", "A"], label: "Go to Appointments" },
      { keys: ["G", "D"], label: "Go to Departments" },
      { keys: ["G", "S"], label: "Go to Staff & Doctors" },
      { keys: ["G", "P"], label: "Go to Patients" },
    ],
  },
  {
    heading: "Global",
    shortcuts: [
      { keys: ["⌘", "K"], label: "Focus global search" },
      { keys: ["⌘", "/"], label: "Open help menu" },
      { keys: ["Esc"], label: "Close panel / dialog" },
    ],
  },
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-fg-placeholder">
                {section.heading}
              </p>
              <ul className="space-y-1.5">
                {section.shortcuts.map(({ keys, label }) => (
                  <li key={label} className="flex items-center justify-between">
                    <span className="text-sm text-fg-secondary">{label}</span>
                    <span className="flex items-center gap-1">
                      {keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-fg-secondary"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
