"use client";

import { Controller, useForm } from "react-hook-form";
import { SingleSelect } from "@/components/ui/single-select";
import { FormField } from "@/components/onboarding/form-field";
import { SectionSaveBar } from "./section-save-bar";
import { useJustSaved } from "./use-just-saved";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-settings";
import { setLocale } from "@/lib/format";
import type { UserPreferences } from "@/lib/types/settings";

const LANGUAGE_OPTIONS = [
  { label: "English (US)", value: "en-US" },
  { label: "English (UK)", value: "en-GB" },
  { label: "French", value: "fr-FR" },
  { label: "German", value: "de-DE" },
];

const TIMEZONE_OPTIONS = [
  { label: "Africa/Accra (GMT+0)", value: "Africa/Accra" },
  { label: "UTC", value: "UTC" },
  { label: "Europe/London (GMT+1)", value: "Europe/London" },
  { label: "America/New_York (GMT-4)", value: "America/New_York" },
];

const DATE_FORMAT_OPTIONS = [
  { label: "Jun 22, 2026 (en-US)", value: "en-US" },
  { label: "22 Jun 2026 (en-GB)", value: "en-GB" },
  { label: "22 juin 2026 (fr-FR)", value: "fr-FR" },
  { label: "22. Jun. 2026 (de-DE)", value: "de-DE" },
];

export function PreferencesCard() {
  const { data: prefs, isLoading } = usePreferences();
  const update = useUpdatePreferences();

  const { control, handleSubmit, reset, formState: { isDirty } } =
    useForm<UserPreferences>({
      values: prefs,
      defaultValues: { language: "en-US", timezone: "Africa/Accra", dateLocale: "en-US" },
    });

  const [justSaved, markSaved] = useJustSaved(isDirty);

  const submit = (values: UserPreferences) => {
    update.mutate(values, {
      onSuccess: (saved) => {
        reset(saved);
        // Wire date locale to lib/format.ts so formatting updates immediately.
        setLocale(saved.dateLocale);
        markSaved();
      },
    });
  };

  if (isLoading || !prefs) {
    return <div className="h-40 animate-pulse rounded-xl bg-surface-muted" />;
  }

  return (
    <form onSubmit={handleSubmit(submit)}>
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-5 text-base font-bold text-fg">Preferences</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField label="Language" htmlFor="language">
            <Controller
              control={control}
              name="language"
              render={({ field }) => (
                <SingleSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={LANGUAGE_OPTIONS}
                  placeholder="Select language"
                />
              )}
            />
          </FormField>

          <FormField label="Timezone" htmlFor="timezone">
            <Controller
              control={control}
              name="timezone"
              render={({ field }) => (
                <SingleSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={TIMEZONE_OPTIONS}
                  placeholder="Select timezone"
                  searchPlaceholder="Search timezones…"
                  emptyText="No timezones found."
                />
              )}
            />
          </FormField>

          <FormField label="Date format" htmlFor="dateLocale">
            <Controller
              control={control}
              name="dateLocale"
              render={({ field }) => (
                <SingleSelect
                  value={field.value}
                  onChange={field.onChange}
                  options={DATE_FORMAT_OPTIONS}
                  placeholder="Select date format"
                />
              )}
            />
          </FormField>
        </div>

        <SectionSaveBar isDirty={isDirty} isSaving={update.isPending} justSaved={justSaved} />
      </div>
    </form>
  );
}
