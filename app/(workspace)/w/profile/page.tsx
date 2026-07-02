"use client";

import { Controller, useForm } from "react-hook-form";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/onboarding/form-field";
import { ImageUpload } from "@/components/ui/image-upload";
import { SectionSaveBar } from "@/components/dashboard/settings/section-save-bar";
import { useJustSaved } from "@/components/dashboard/settings/use-just-saved";
import { DutyControl } from "@/components/dashboard/staff/duty-control";
import { useStaffMember, useUpdateStaff } from "@/hooks/use-staff";
import { useWorkspaceSession } from "@/hooks/use-workspace-session";
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
          <div className="mx-auto max-w-xl">
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
        <div className="mx-auto flex max-w-xl flex-col gap-6">
          {/* Profile card — same layout as Settings → Profile & Account */}
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

          {/* Duty status — separate card, same style as other settings cards */}
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
        </div>
      </div>
    </div>
  );
}
