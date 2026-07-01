"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/onboarding/form-field";
import { ImageUpload } from "@/components/ui/image-upload";
import { SectionSaveBar } from "./section-save-bar";
import { useJustSaved } from "./use-just-saved";
import { ChangePasswordDialog } from "./change-password-dialog";
import { SessionsCard } from "./sessions-card";
import { TwoFactorCard } from "./two-factor-card";
import { PreferencesCard } from "./preferences-card";
import { DangerZoneCard } from "./danger-zone-card";
import { useProfile, useUpdateProfile } from "@/hooks/use-settings";
import type { AdminProfile } from "@/lib/types/settings";

const NOTIFICATION_OPTIONS: {
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

export function ProfileSection() {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<AdminProfile>({
    values: profile,
    defaultValues: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      avatarUrl: undefined,
      notificationPreferences: {
        emailOnNewAppointment: false,
        emailOnNoShow: false,
        smsOnQueueAlert: false,
        dailySummaryEmail: false,
      },
    },
  });

  const [justSaved, markSaved] = useJustSaved(isDirty);

  const submit = (values: AdminProfile) => {
    update.mutate(values, { onSuccess: (saved) => { reset(saved); markSaved(); } });
  };

  if (isLoading || !profile) {
    return <div className="h-80 animate-pulse rounded-xl bg-surface-muted" />;
  }

  return (
    <>
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-5 text-base font-bold text-fg">Your profile</h2>

          <div className="space-y-6">
            <Controller
              control={control}
              name="avatarUrl"
              render={({ field }) => (
                <ImageUpload
                  value={field.value ?? null}
                  onChange={field.onChange}
                  shape="circle"
                  size={80}
                  label="Profile photo (optional)"
                />
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                label="Full name"
                htmlFor="fullName"
                error={errors.fullName?.message}
              >
                <Input
                  id="fullName"
                  {...register("fullName", { required: "Required." })}
                />
              </FormField>
              <FormField label="Title" htmlFor="title">
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g. Chief Administrator"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                label="Email"
                htmlFor="email"
                error={errors.email?.message}
              >
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: "Required." })}
                />
              </FormField>
              <FormField label="Phone" htmlFor="phone">
                <Input id="phone" {...register("phone")} />
              </FormField>
            </div>
          </div>

          <SectionSaveBar
            isDirty={isDirty}
            isSaving={update.isPending}
            justSaved={justSaved}
          />
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-1 text-base font-bold text-fg">
            Notification preferences
          </h2>
          <p className="mb-5 text-sm text-fg-muted">
            Personal alerts for your account — separate from the facility-wide
            defaults under Operational.
          </p>

          <div className="space-y-4">
            {NOTIFICATION_OPTIONS.map((opt) => (
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

        {/* Password — inline inline-action card that opens the dialog */}
        <div className="flex items-center justify-between rounded-xl border border-border mb-6 bg-surface p-5">
          <span className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <KeyRound className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-medium text-fg">
                Password
              </span>
              <span className="block text-xs text-fg-muted">
                Change the password used to sign in
              </span>
            </span>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPasswordDialogOpen(true)}
          >
            Change password
          </Button>
        </div>
      </form>

      {/* Sessions, 2FA, Preferences, Danger zone — independent from the form above */}
      <div className="flex flex-col gap-6">
        <SessionsCard />
        <TwoFactorCard />
        <PreferencesCard />
        <DangerZoneCard />
      </div>

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />
    </>
  );
}
