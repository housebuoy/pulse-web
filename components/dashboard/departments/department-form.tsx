"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SingleSelect } from "@/components/ui/single-select";
import { FormField } from "@/components/onboarding/form-field";
import { TIMES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DepartmentFormValues } from "@/lib/types/departments";

const fmt = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
const TIME_OPTIONS = TIMES.map((t) => ({ label: fmt(t), value: t }));

type FormErrors = Partial<
  Record<"name" | "code" | "headDoctorName" | "totalDoctors" | "rooms", string>
>;

export function DepartmentForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Create department",
  pendingLabel = "Creating…",
}: {
  initialValues?: Partial<DepartmentFormValues>;
  onSubmit: (values: DepartmentFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
  pendingLabel?: string;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [code, setCode] = useState(initialValues?.code ?? "");
  const [headDoctorName, setHeadDoctorName] = useState(
    initialValues?.headDoctorName ?? "",
  );
  const [totalDoctors, setTotalDoctors] = useState(
    String(initialValues?.totalDoctors ?? 1),
  );
  const [rooms, setRooms] = useState(String(initialValues?.rooms ?? 1));
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [twentyFourSeven, setTwentyFourSeven] = useState(
    initialValues?.twentyFourSeven ?? false,
  );
  const [opensAt, setOpensAt] = useState(initialValues?.opensAt ?? "08:00");
  const [closesAt, setClosesAt] = useState(initialValues?.closesAt ?? "17:00");
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = "Department name is required.";
    if (!code.trim()) nextErrors.code = "Short code is required.";
    if (!headDoctorName.trim())
      nextErrors.headDoctorName = "Head doctor is required.";
    if (!totalDoctors || Number(totalDoctors) < 1)
      nextErrors.totalDoctors = "Must be at least 1.";
    if (!rooms || Number(rooms) < 1) nextErrors.rooms = "Must be at least 1.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      headDoctorName: headDoctorName.trim(),
      totalDoctors: Number(totalDoctors),
      rooms: Number(rooms),
      description: description.trim() || undefined,
      twentyFourSeven,
      opensAt,
      closesAt,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <FormField label="Department name" htmlFor="name" error={errors.name}>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cardiology"
          />
        </FormField>

        <FormField label="Short code" htmlFor="code" error={errors.code}>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. CARD"
            maxLength={6}
          />
        </FormField>
      </div>

      <FormField
        label="Head doctor"
        htmlFor="headDoctorName"
        error={errors.headDoctorName}
      >
        <Input
          id="headDoctorName"
          value={headDoctorName}
          onChange={(e) => setHeadDoctorName(e.target.value)}
          placeholder="e.g. Dr. Owusu"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-6">
        <FormField
          label="Doctors on staff"
          htmlFor="totalDoctors"
          error={errors.totalDoctors}
        >
          <Input
            id="totalDoctors"
            type="number"
            min={1}
            value={totalDoctors}
            onChange={(e) => setTotalDoctors(e.target.value)}
          />
        </FormField>

        <FormField label="Rooms" htmlFor="rooms" error={errors.rooms}>
          <Input
            id="rooms"
            type="number"
            min={1}
            value={rooms}
            onChange={(e) => setRooms(e.target.value)}
          />
        </FormField>
      </div>

      <div className="space-y-3">
        <span className="text-label text-fg-secondary">Operating hours</span>

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
          <div className="grid grid-cols-2 gap-6">
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

      <FormField label="Description (optional)" htmlFor="description">
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What this department covers…"
          rows={3}
        />
      </FormField>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Plus className="size-4" />
          {isSubmitting ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
