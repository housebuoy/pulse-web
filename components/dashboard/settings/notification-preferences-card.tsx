"use client";

import { Controller, useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { SectionSaveBar } from "./section-save-bar";
import { useJustSaved } from "./use-just-saved";
import { useProfile, useUpdateProfile } from "@/hooks/use-settings";
import type { AdminProfile } from "@/lib/types/settings";

type FormValues = {
  notificationPreferences: AdminProfile["notificationPreferences"];
};

const OPTIONS: {
  key: keyof AdminProfile["notificationPreferences"];
  label: string;
  description: string;
}[] = [
  {
    key: "emailOnNewAppointment",
    label: "Email me on new appointments",
    description: "A notification each time a new appointment is booked.",
  },
  {
    key: "emailOnNoShow",
    label: "Email me on no-shows",
    description: "A notification when a patient misses an appointment.",
  },
  {
    key: "smsOnQueueAlert",
    label: "SMS me on queue alerts",
    description: "A text when a department's queue backs up.",
  },
  {
    key: "dailySummaryEmail",
    label: "Daily summary email",
    description: "A digest of the day's activity, sent each evening.",
  },
];

export function NotificationPreferencesCard() {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();

  const { control, handleSubmit, reset, formState: { isDirty } } =
    useForm<FormValues>({
      values: profile
        ? { notificationPreferences: profile.notificationPreferences }
        : undefined,
      defaultValues: {
        notificationPreferences: {
          emailOnNewAppointment: false,
          emailOnNoShow: false,
          smsOnQueueAlert: false,
          dailySummaryEmail: false,
        },
      },
    });

  const [justSaved, markSaved] = useJustSaved(isDirty);

  const submit = (values: FormValues) => {
    if (!profile) return;
    update.mutate(
      { ...profile, notificationPreferences: values.notificationPreferences },
      {
        onSuccess: (saved) => {
          reset({ notificationPreferences: saved.notificationPreferences });
          markSaved();
        },
      },
    );
  };

  if (isLoading || !profile) {
    return <div className="h-48 animate-pulse rounded-xl bg-surface-muted" />;
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-1 text-base font-bold text-fg">
          Notification preferences
        </h2>
        <p className="mb-5 text-sm text-fg-muted">
          Personal alerts for your account — separate from the facility-wide
          defaults under Operational.
        </p>

        <div className="space-y-4">
          {OPTIONS.map((opt) => (
            <Controller
              key={opt.key}
              control={control}
              name={`notificationPreferences.${opt.key}`}
              render={({ field }) => (
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={opt.key}
                    checked={field.value}
                    onCheckedChange={(c) => field.onChange(c === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor={opt.key} className="space-y-0.5">
                    <span className="block text-sm font-medium text-fg-secondary">
                      {opt.label}
                    </span>
                    <span className="block text-xs text-fg-muted">
                      {opt.description}
                    </span>
                  </label>
                </div>
              )}
            />
          ))}
        </div>

        <SectionSaveBar
          isDirty={isDirty}
          isSaving={update.isPending}
          justSaved={justSaved}
        />
      </div>
    </form>
  );
}
