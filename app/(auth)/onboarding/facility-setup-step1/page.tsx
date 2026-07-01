// app/(auth)/onboarding/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/onboarding/step-progress";
import { StepHeader } from "@/components/onboarding/step-header";
import { FormField } from "@/components/onboarding/form-field";
import { FileUpload } from "@/components/onboarding/file-upload";
import { ImageUpload } from "@/components/ui/image-upload";
import { IncompleteSetupDialog } from "@/components/onboarding/incomplete-setup-dialog";
import { SingleSelect } from "@/components/ui/single-select";
import { MapPin } from "lucide-react";
import { REGIONS } from "@/lib/constants";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import type { OnboardingData } from "@/store/use-onboarding-store";

const REGION_OPTIONS = REGIONS.map((r) => ({ label: r, value: r }));

export default function WorkspaceStepOne() {
  const router = useRouter();

  const formData = useOnboardingStore((state) => state.data);
  const updateData = useOnboardingStore((state) => state.updateData);

  const [showDialog, setShowDialog] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData({ [name]: value } as Partial<OnboardingData>);
  };

  const proceedToNextStep = () => {
    router.push("/onboarding/departments-step2"); // Adjust path to your actual Step 2
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If the document is missing, pause and show the warning modal
    if (!formData.document) {
      setShowDialog(true);
      return; // Stop execution here
    }

    // If everything is perfectly complete, proceed directly
    proceedToNextStep();
  };

  const handlePickLocation = () => {
    // TODO: open map picker (current location / landmark search)
  };

  return (
    <>
      <StepProgress current={1} />

      <StepHeader
        title="Let's set up your hospital"
        description="Please provide the initial registration details for your facility."
      />

      <form onSubmit={handleSubmit} className="mt-10 flex-1 space-y-6">
        <ImageUpload
          value={formData.logoUrl ?? null}
          onChange={(url) => updateData({ logoUrl: url ?? undefined })}
          shape="square"
          size={80}
          label="Facility logo (optional)"
        />

        <FormField label="Hospital Name" htmlFor="hospitalName">
          <Input
            id="hospitalName"
            name="hospitalName"
            value={formData.hospitalName}
            onChange={handleChange}
            placeholder="e.g. Saint Mary's Medical Center"
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

        <FormField label="HeFRA License Number" htmlFor="hefraLicense">
          <Input
            id="hefraLicense"
            name="hefraLicense"
            value={formData.hefraLicense}
            onChange={handleChange}
            placeholder="HFR-XXXX-XXXX"
          />
        </FormField>

        <FormField label="Verification Document" htmlFor="document">
          <FileUpload
            id="document"
            value={formData.document}
            onChange={(file) => updateData({ document: file })}
            accept=".pdf,image/*"
            hint="Upload PDF or Image. Max 5MB"
          />
        </FormField>

        <div className="py-6">
          <Button type="submit" className="ml-auto flex h-12 w-32 shadow-brand">
            Next Step
          </Button>
        </div>
      </form>
      <IncompleteSetupDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onConfirm={() => {
          setShowDialog(false); // Close the modal
          proceedToNextStep(); // Move to Step 2 without the document
        }}
      />
    </>
  );
}
