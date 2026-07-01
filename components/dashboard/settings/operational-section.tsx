"use client";

import { Plus, X } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/onboarding/form-field";
import { SectionSaveBar } from "./section-save-bar";
import { useJustSaved } from "./use-just-saved";
import { useOperational, useUpdateOperational } from "@/hooks/use-settings";
import type { OperationalSettings } from "@/lib/types/settings";

export function OperationalSection() {
  const { data: operational, isLoading } = useOperational();
  const update = useUpdateOperational();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<OperationalSettings>({
    values: operational,
    defaultValues: {
      queuePriorityLevels: [],
      queueRefreshSeconds: 10,
      appointmentSlotMinutes: 20,
      noShowGraceMinutes: 15,
      notificationDefaults: {
        sendPatientEmailConfirmations: false,
        sendPatientSmsReminders: false,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "queuePriorityLevels",
  });

  const [justSaved, markSaved] = useJustSaved(isDirty);

  const submit = (values: OperationalSettings) => {
    update.mutate(values, { onSuccess: (saved) => { reset(saved); markSaved(); } });
  };

  if (isLoading || !operational) {
    return <div className="h-96 animate-pulse rounded-xl bg-surface-muted" />;
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-1 text-base font-bold text-fg">Queue rules</h2>
        <p className="mb-5 text-sm text-fg-muted">
          Priority levels drive call order in the Live Queue — higher weight
          is served sooner.
        </p>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-end gap-2 rounded-md border border-border p-3"
            >
              <div className="grid flex-1 grid-cols-2 gap-3">
                <FormField label="Label" htmlFor={`priority-label-${index}`}>
                  <Input
                    id={`priority-label-${index}`}
                    {...register(`queuePriorityLevels.${index}.label`)}
                  />
                </FormField>
                <FormField label="Weight" htmlFor={`priority-weight-${index}`}>
                  <Input
                    id={`priority-weight-${index}`}
                    type="number"
                    {...register(`queuePriorityLevels.${index}.weight`, {
                      valueAsNumber: true,
                    })}
                  />
                </FormField>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove priority level"
                onClick={() => remove(index)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              append({ id: crypto.randomUUID(), label: "", weight: 1 })
            }
            className="flex items-center gap-2 text-body-sm font-medium text-brand hover:underline"
          >
            <Plus className="h-4 w-4" /> Add priority level
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <FormField label="Queue refresh cadence" htmlFor="queueRefreshSeconds">
            <div className="relative flex w-full items-center">
              <Input
                id="queueRefreshSeconds"
                type="number"
                min="5"
                {...register("queueRefreshSeconds", { valueAsNumber: true })}
                className="pr-16"
              />
              <span className="pointer-events-none absolute right-4 text-body text-fg-muted">
                sec
              </span>
            </div>
          </FormField>
        </div>

        <SectionSaveBar isDirty={isDirty} isSaving={update.isPending} justSaved={justSaved} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-5 text-base font-bold text-fg">Appointment rules</h2>

        <div className="grid grid-cols-2 gap-6">
          <FormField label="Slot length" htmlFor="appointmentSlotMinutes">
            <div className="relative flex w-full items-center">
              <Input
                id="appointmentSlotMinutes"
                type="number"
                min="5"
                {...register("appointmentSlotMinutes", { valueAsNumber: true })}
                className="pr-20"
              />
              <span className="pointer-events-none absolute right-4 text-body text-fg-muted">
                minutes
              </span>
            </div>
          </FormField>
          <FormField label="No-show grace period" htmlFor="noShowGraceMinutes">
            <div className="relative flex w-full items-center">
              <Input
                id="noShowGraceMinutes"
                type="number"
                min="0"
                {...register("noShowGraceMinutes", { valueAsNumber: true })}
                className="pr-20"
              />
              <span className="pointer-events-none absolute right-4 text-body text-fg-muted">
                minutes
              </span>
            </div>
          </FormField>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-1 text-base font-bold text-fg">
          Patient notification defaults
        </h2>
        <p className="mb-5 text-sm text-fg-muted">
          Facility-wide defaults for patient-facing messages — separate from
          your personal alerts under Profile &amp; Account.
        </p>

        <div className="space-y-4">
          <Controller
            control={control}
            name="notificationDefaults.sendPatientEmailConfirmations"
            render={({ field }) => (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="sendPatientEmailConfirmations"
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(c === true)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="sendPatientEmailConfirmations"
                  className="text-sm font-medium text-fg-secondary"
                >
                  Send patients email confirmations by default
                </label>
              </div>
            )}
          />
          <Controller
            control={control}
            name="notificationDefaults.sendPatientSmsReminders"
            render={({ field }) => (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="sendPatientSmsReminders"
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(c === true)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="sendPatientSmsReminders"
                  className="text-sm font-medium text-fg-secondary"
                >
                  Send patients SMS reminders by default
                </label>
              </div>
            )}
          />
        </div>

        <SectionSaveBar isDirty={isDirty} isSaving={update.isPending} justSaved={justSaved} />
      </div>
    </form>
  );
}
