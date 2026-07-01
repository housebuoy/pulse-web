"use client";

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SingleSelect } from "@/components/ui/single-select";
import { MultiSelect } from "@/components/ui/multi-select";
import { FormField } from "@/components/onboarding/form-field";
import { OperatingHours } from "@/components/onboarding/operating-hours";
import { ImageUpload } from "@/components/ui/image-upload";
import { SectionSaveBar } from "./section-save-bar";
import { useJustSaved } from "./use-just-saved";
import { useFacility, useUpdateFacility } from "@/hooks/use-settings";
import { DEPARTMENTS, REGIONS } from "@/lib/constants";
import type { FacilityProfile, FacilityType } from "@/lib/types/settings";

const FACILITY_TYPE_LABEL: Record<FacilityType, string> = {
  hospital: "Hospital",
  clinic: "Clinic",
  health_center: "Health Center",
  diagnostic_center: "Diagnostic Center",
};
const FACILITY_TYPE_OPTIONS = (Object.keys(FACILITY_TYPE_LABEL) as FacilityType[]).map(
  (t) => ({ label: FACILITY_TYPE_LABEL[t], value: t }),
);
const REGION_OPTIONS = REGIONS.map((r) => ({ label: r, value: r }));

export function FacilitySection() {
  const { data: facility, isLoading } = useFacility();
  const update = useUpdateFacility();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<FacilityProfile>({
    // `values` drives dirty-state tracking against the loaded data.
    // `defaultValues` guarantees every field has the right type from the very
    // first render — before the `values` sync useEffect fires — so that array
    // fields like `specialties` are never `undefined.map(…)`.
    values: facility,
    defaultValues: {
      hospitalName: "",
      facilityType: "hospital",
      region: "",
      address: "",
      hefraLicense: "",
      phone: "",
      email: "",
      specialties: [],
      capacity: "",
      duration: "",
      operatingHours: { alwaysOpen: false, schedules: [] },
      logoUrl: undefined,
    },
  });

  const [justSaved, markSaved] = useJustSaved(isDirty);

  const submit = (values: FacilityProfile) => {
    update.mutate(values, { onSuccess: (saved) => { reset(saved); markSaved(); } });
  };

  if (isLoading || !facility) {
    return <div className="h-96 animate-pulse rounded-xl bg-surface-muted" />;
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-5 text-base font-bold text-fg">Facility profile</h2>

        <div className="space-y-6">
          <Controller
            control={control}
            name="logoUrl"
            render={({ field }) => (
              <ImageUpload
                value={field.value ?? null}
                onChange={field.onChange}
                shape="square"
                size={80}
                label="Facility logo (optional)"
              />
            )}
          />

          <div className="grid grid-cols-2 gap-6">
            <FormField
              label="Facility name"
              htmlFor="hospitalName"
              error={errors.hospitalName?.message}
            >
              <Input
                id="hospitalName"
                {...register("hospitalName", { required: "Required." })}
              />
            </FormField>
            <FormField label="Facility type" htmlFor="facilityType">
              <Controller
                control={control}
                name="facilityType"
                render={({ field }) => (
                  <SingleSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={FACILITY_TYPE_OPTIONS}
                    placeholder="Select type"
                  />
                )}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormField label="Region" htmlFor="region">
              <Controller
                control={control}
                name="region"
                render={({ field }) => (
                  <SingleSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={REGION_OPTIONS}
                    placeholder="Select region"
                    searchPlaceholder="Search regions…"
                    emptyText="No regions found."
                  />
                )}
              />
            </FormField>
            <FormField label="Address" htmlFor="address">
              <Input id="address" {...register("address")} />
            </FormField>
          </div>

          <FormField label="HeFRA license number" htmlFor="hefraLicense">
            <Input id="hefraLicense" {...register("hefraLicense")} />
          </FormField>

          <div className="grid grid-cols-2 gap-6">
            <FormField label="Public contact phone" htmlFor="phone">
              <Input id="phone" {...register("phone")} />
            </FormField>
            <FormField label="Public contact email" htmlFor="email">
              <Input id="email" type="email" {...register("email")} />
            </FormField>
          </div>

          <FormField label="Specialties offered" htmlFor="specialties">
            <Controller
              control={control}
              name="specialties"
              render={({ field }) => (
                <MultiSelect
                  id="specialties"
                  value={field.value}
                  onChange={field.onChange}
                  options={DEPARTMENTS}
                  placeholder="Click to add department…"
                  searchPlaceholder="Search departments…"
                  emptyText="No departments found."
                  allowCustom
                />
              )}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-6">
            <FormField label="Daily patient capacity" htmlFor="capacity">
              <Input id="capacity" type="number" {...register("capacity")} />
            </FormField>
            <FormField label="Default consult duration" htmlFor="duration">
              <div className="relative flex w-full items-center">
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  {...register("duration")}
                  className="pr-20"
                />
                <span className="pointer-events-none absolute right-4 text-body text-fg-muted">
                  minutes
                </span>
              </div>
            </FormField>
          </div>

          <FormField label="Operating hours" htmlFor="operatingHours">
            <Controller
              control={control}
              name="operatingHours"
              render={({ field }) => (
                <OperatingHours value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>
        </div>

        <SectionSaveBar isDirty={isDirty} isSaving={update.isPending} justSaved={justSaved} />
      </div>

      <Link
        href="/d/departments"
        className="flex items-center justify-between rounded-xl border border-border bg-surface p-5 transition-colors hover:bg-surface-subtle"
      >
        <span className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Building2 className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-medium text-fg">
              Departments
            </span>
            <span className="block text-xs text-fg-muted">
              Manage department setup, hours, and staffing
            </span>
          </span>
        </span>
        <ArrowRight className="size-4 text-fg-muted" />
      </Link>
    </form>
  );
}
