"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/onboarding/form-field";
import { ImageUpload } from "@/components/ui/image-upload";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SectionSaveBar } from "@/components/dashboard/settings/section-save-bar";
import { useJustSaved } from "@/components/dashboard/settings/use-just-saved";
import { DutyControl } from "@/components/dashboard/staff/duty-control";
import { NotificationPreferencesCard } from "@/components/dashboard/settings/notification-preferences-card";
import { PasswordCard } from "@/components/dashboard/settings/password-card";
import { SessionsCard } from "@/components/dashboard/settings/sessions-card";
import { TwoFactorCard } from "@/components/dashboard/settings/two-factor-card";
import { PreferencesCard } from "@/components/dashboard/settings/preferences-card";
import { DangerZoneCard } from "@/components/dashboard/settings/danger-zone-card";
import { useStaffMember, useUpdateStaff } from "@/hooks/use-staff";
import { useWorkspaceSession } from "@/hooks/use-workspace-session";
import { clearSession } from "@/lib/mock/auth";
import type { DutyStatus } from "@/lib/types/staff";

interface ProfileFormValues {
  name: string;
  title: string;
  specialty?: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export default function WorkspaceProfilePage() {
  const session = useWorkspaceSession();
  const router = useRouter();
  const { data: member, isLoading } = useStaffMember(session.staffId);
  const update = useUpdateStaff();

  const {
    register,
    control,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<ProfileFormValues>({
    values: member
      ? {
          name: member.name,
          title: member.title,
          specialty: member.specialty,
          email: member.email,
          phone: member.phone,
          avatarUrl: member.avatarUrl,
        }
      : undefined,
  });

  const [justSaved, markSaved] = useJustSaved(isDirty);

  const submit = (values: ProfileFormValues) => {
    if (!member) return;
    update.mutate({ id: member.id, ...values }, { onSuccess: markSaved });
  };

  const handleDutyChange = (dutyStatus: DutyStatus) => {
    if (!member) return;
    update.mutate({ id: member.id, dutyStatus });
  };

  if (isLoading || !member) {
    return (
      <div className="flex h-full flex-col">
        <DashboardHeader title="Profile" />
        <div className="flex-1 p-8">
          <div className="mx-auto w-full max-w-3xl">
            <div className="h-80 animate-pulse rounded-xl bg-surface-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="Profile" />

      <div className="min-h-0 flex-1 overflow-y-auto p-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">

          {/* ── Clinical profile (doctor-specific) ── */}
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
                    htmlFor="name"
                    error={errors.name?.message}
                  >
                    <Input
                      id="name"
                      {...register("name", { required: "Required." })}
                    />
                  </FormField>
                  <FormField label="Title" htmlFor="title">
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="e.g. Cardiologist"
                    />
                  </FormField>
                </div>

                <FormField label="Specialty" htmlFor="specialty">
                  <Input
                    id="specialty"
                    {...register("specialty")}
                    placeholder="e.g. Interventional Cardiology"
                  />
                </FormField>

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

          {/* ── Duty status (doctor-only) ── */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="mb-1 text-base font-bold text-fg">Duty status</h2>
            <p className="mb-4 text-sm text-fg-muted">
              Sets your availability for the queue and appointments system.
            </p>
            <DutyControl
              value={member.dutyStatus}
              onChange={handleDutyChange}
              disabled={update.isPending}
            />
          </div>

          {/* ── Shared account sections (identical to admin /d/profile) ── */}
          <NotificationPreferencesCard />
          <PasswordCard />
          <SessionsCard />
          <TwoFactorCard />
          <PreferencesCard />
          <DangerZoneCard />

          {/* ── Log out ── */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-5">
            <span>
              <span className="block text-sm font-medium text-fg">Sign out</span>
              <span className="block text-xs text-fg-muted">
                Sign out of your workspace on this device.
              </span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                clearSession();
                router.push("/login");
              }}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
