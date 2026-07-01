"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SingleSelect } from "@/components/ui/single-select";
import { TIMES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUpdateDepartment } from "@/hooks/use-departments";
import type { Department } from "@/lib/types/departments";

const fmt = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const TIME_OPTIONS = TIMES.map((t) => ({ label: fmt(t), value: t }));

export function AdjustHoursDialog({
  department,
  open,
  onOpenChange,
}: {
  department: Department;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [twentyFourSeven, setTwentyFourSeven] = useState(
    department.twentyFourSeven ?? false,
  );
  const [opensAt, setOpensAt] = useState(department.opensAt);
  const [closesAt, setClosesAt] = useState(department.closesAt);
  const update = useUpdateDepartment();

  const handleSave = () => {
    update.mutate(
      { id: department.id, opensAt, closesAt, twentyFourSeven },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust hours</DialogTitle>
          <DialogDescription>
            Update the operating hours for {department.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex w-fit gap-1 rounded-md bg-surface-muted p-1">
            {[
              {
                label: "Set hours",
                on: !twentyFourSeven,
                action: () => setTwentyFourSeven(false),
              },
              {
                label: "Open 24/7",
                on: twentyFourSeven,
                action: () => setTwentyFourSeven(true),
              },
            ].map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={tab.action}
                className={cn(
                  "rounded-sm px-4 py-1.5 text-body-sm transition-colors",
                  tab.on
                    ? "bg-surface text-fg shadow-input"
                    : "text-fg-muted hover:text-fg-secondary",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {!twentyFourSeven && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-body-sm font-medium text-fg-secondary">
                  Opens
                </span>
                <SingleSelect
                  value={opensAt}
                  onChange={setOpensAt}
                  options={TIME_OPTIONS}
                  placeholder="Select time"
                  searchPlaceholder="Search time…"
                  emptyText="No times found."
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-body-sm font-medium text-fg-secondary">
                  Closes
                </span>
                <SingleSelect
                  value={closesAt}
                  onChange={setClosesAt}
                  options={TIME_OPTIONS}
                  placeholder="Select time"
                  searchPlaceholder="Search time…"
                  emptyText="No times found."
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
