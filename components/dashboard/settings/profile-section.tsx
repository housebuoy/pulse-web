"use client";

import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/onboarding/form-field";
import { ImageUpload } from "@/components/ui/image-upload";
import { SectionSaveBar } from "./section-save-bar";
import { useJustSaved } from "./use-just-saved";
import { NotificationPreferencesCard } from "./notification-preferences-card";
import { PasswordCard } from "./password-card";
import { SessionsCard } from "./sessions-card";
import { TwoFactorCard } from "./two-factor-card";
import { PreferencesCard } from "./preferences-card";
import { DangerZoneCard } from "./danger-zone-card";
import { useProfile, useUpdateProfile } from "@/hooks/use-settings";
import type { AdminProfile } from "@/lib/types/settings";

type ProfileFormValues = Pick<
  AdminProfile,
  "fullName" | "title" | "email" | "phone" | "avatarUrl"
>;

export function ProfileSection() {
  const { data: profile, isLoading } = useProfile();
  const update = useUpdateProfile();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<ProfileFormValues>({
    values: profile
      ? {
          fullName: profile.fullName,
          title: profile.title,
          email: profile.email,
          phone: profile.phone,
          avatarUrl: profile.avatarUrl,
        }
      : undefined,
    defaultValues: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      avatarUrl: undefined,
    },
  });

  const [justSaved, markSaved] = useJustSaved(isDirty);

  const submit = (values: ProfileFormValues) => {
    if (!profile) return;
    update.mutate(
      { ...profile, ...values },
      {
        onSuccess: (saved) => {
          reset({
            fullName: saved.fullName,
            title: saved.title,
            email: saved.email,
            phone: saved.phone,
            avatarUrl: saved.avatarUrl,
          });
          markSaved();
        },
      },
    );
  };

  if (isLoading || !profile) {
    return <div className="h-80 shimmer rounded-xl bg-surface-muted" />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Profile fields */}
      <form onSubmit={handleSubmit(submit)}>
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
      </form>

      {/* Shared account sections — same components used in /w/profile */}
      <NotificationPreferencesCard />
      <PasswordCard />
      <SessionsCard />
      <TwoFactorCard />
      <PreferencesCard />
      <DangerZoneCard />
    </div>
  );
}
