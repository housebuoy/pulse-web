"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterPill, FilterTab } from "@/components/dashboard/filter-tabs";
import { cn } from "@/lib/utils";
import { GENDER_LABEL } from "@/lib/patient-utils";
import type { Gender } from "@/lib/types/patients";

export type PatientScope = "all" | "here";
type GenderFilter = Gender | "all";

const GENDER_OPTIONS: { value: GenderFilter; label: string }[] = [
  { value: "all", label: "All genders" },
  { value: "female", label: GENDER_LABEL.female },
  { value: "male", label: GENDER_LABEL.male },
  { value: "other", label: GENDER_LABEL.other },
];

export function PatientToolbar({
  scope,
  onScopeChange,
  totalCount,
  hereCount,
  departments,
  departmentId,
  onDepartmentChange,
  gender,
  onGenderChange,
  onAddPatient,
}: {
  scope: PatientScope;
  onScopeChange: (scope: PatientScope) => void;
  totalCount: number;
  hereCount: number;
  departments: { id: string; name: string }[];
  departmentId: string;
  onDepartmentChange: (id: string) => void;
  gender: GenderFilter;
  onGenderChange: (gender: GenderFilter) => void;
  onAddPatient: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex w-fit items-center gap-1 rounded-md bg-surface-muted p-1">
          <button
            type="button"
            onClick={() => onScopeChange("all")}
            className={cn(
              "rounded-sm px-4 py-1.5 text-body-sm font-medium transition-colors",
              scope === "all"
                ? "bg-surface text-fg shadow-input"
                : "text-fg-muted hover:text-fg-secondary",
            )}
          >
            All patients ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => onScopeChange("here")}
            className={cn(
              "inline-flex items-center gap-2 rounded-sm px-4 py-1.5 text-body-sm font-medium transition-colors",
              scope === "here"
                ? "bg-surface text-fg shadow-input"
                : "text-fg-muted hover:text-fg-secondary",
            )}
          >
            Currently here
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-success/15 px-1.5 text-xs font-bold text-success">
              {hereCount}
            </span>
          </button>
        </div>

        <Button size="sm" onClick={onAddPatient}>
          <Plus className="size-4" />
          New patient
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterTab
          active={departmentId === "all"}
          label="All Departments"
          onClick={() => onDepartmentChange("all")}
        />
        {departments.map((d) => (
          <FilterTab
            key={d.id}
            active={departmentId === d.id}
            label={d.name}
            onClick={() => onDepartmentChange(d.id)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-medium text-fg-muted">Gender</span>
        {GENDER_OPTIONS.map((opt) => (
          <FilterPill
            key={opt.value}
            active={gender === opt.value}
            label={opt.label}
            onClick={() => onGenderChange(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}
