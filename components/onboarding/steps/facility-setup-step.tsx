"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/onboarding/step-progress";
import { StepHeader } from "@/components/onboarding/step-header";
import { FormField } from "@/components/onboarding/form-field";
import { FileUpload } from "@/components/onboarding/file-upload";
import { ImageUpload } from "@/components/ui/image-upload";
import { SingleSelect } from "@/components/ui/single-select";
import { REGIONS } from "@/lib/constants";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import type { OnboardingData } from "@/store/use-onboarding-store";

const REGION_OPTIONS = REGIONS.map((r) => ({ label: r, value: r }));

export function FacilitySetupStep({ onNext }: { onNext: () => void }) {
  const router = useRouter();
  const formData = useOnboardingStore((state) => state.data);
  const updateData = useOnboardingStore((state) => state.updateData);

  const [logoError, setLogoError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData({ [name]: value } as Partial<OnboardingData>);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logo is the only required artifact on this step — HeFRA license and
    // document are optional (they speed up verification but the grace-
    // period flow, see BACKEND_SPEC-adjacent copy on /request-access,
    // exists precisely to let a facility onboard before HeFRA is in hand).
    if (!formData.logoUrl) {
      setLogoError(true);
      return;
    }
    onNext();
  };

  const handlePickLocation = () => {
    // TODO: open map picker (current location / landmark search)
  };

  return (
    <>
      <StepProgress current={1} total={3} onBack={() => router.back()} />

      <StepHeader
        title="Let's set up your hospital"
        description="Please provide the initial registration details for your facility."
      />

      <form onSubmit={handleSubmit} className="mt-10 flex-1 space-y-6">
        <div>
          <ImageUpload
            value={formData.logoUrl ?? null}
            onChange={(url) => {
              updateData({ logoUrl: url ?? undefined });
              if (url) setLogoError(false);
            }}
            shape="square"
            size={80}
            label="Facility logo"
          />
          {logoError && (
            <p className="mt-2 text-caption text-destructive">
              Facility logo is required.
            </p>
          )}
        </div>

        <FormField label="Hospital Name" htmlFor="hospitalName">
          <Input
            id="hospitalName"
            name="hospitalName"
            value={formData.hospitalName}
            onChange={handleChange}
            placeholder="e.g. Saint Mary's Medical Center"
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-6">
          <FormField label="Region" htmlFor="region">
            <SingleSelect
              value={formData.region}
              onChange={(v) => updateData({ region: v })}
              options={REGION_OPTIONS}
              placeholder="Select region"
              searchPlaceholder="Search regions…"
              emptyText="No regions found."
            />
          </FormField>

          <FormField label="Address" htmlFor="address">
            <div className="relative">
              <button
                type="button"
                onClick={handlePickLocation}
                aria-label="Pick location on map"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted transition-colors hover:text-brand"
              >
                <MapPin className="h-4 w-4" />
              </button>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter physical street address"
                className="pl-9"
              />
            </div>
          </FormField>
        </div>

        <FormField label="HeFRA License Number (optional)" htmlFor="hefraLicense">
          <Input
            id="hefraLicense"
            name="hefraLicense"
            value={formData.hefraLicense}
            onChange={handleChange}
            placeholder="HFR-XXXX-XXXX"
          />
          <p className="text-caption text-fg-muted">
            Optional — speeds up verification.
          </p>
        </FormField>

        <FormField label="Verification Document (optional)" htmlFor="document">
          <FileUpload
            id="document"
            value={formData.document}
            onChange={(file) => updateData({ document: file })}
            accept=".pdf,image/*"
            hint="Optional — speeds up verification. PDF or Image, max 5MB"
          />
        </FormField>

        <div className="py-6">
          <Button type="submit" className="ml-auto flex h-12 w-32 shadow-brand">
            Next Step
          </Button>
        </div>
      </form>
    </>
  );
}
