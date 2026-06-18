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
import { IncompleteSetupDialog } from "@/components/onboarding/incomplete-setup-dialog";

export default function WorkspaceStepOne() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    hospitalName: "",
    address: "",
    hefraLicense: "",
    document: null as File | null,
  });

  const [showDialog, setShowDialog] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const proceedToNextStep = () => {
    // TODO: Save formData to your state management or API here
    console.log("Proceeding to Step 2 with data:", formData);
    router.push("/onboarding/departments"); // Adjust path to your actual Step 2
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

  return (
    <>
      <StepProgress current={1} />

      <StepHeader
        title="Let's set up your hospital"
        description="Please provide the initial registration details for your facility."
      />

      <form onSubmit={handleSubmit} className="mt-10 flex-1 space-y-6">
        <FormField label="Hospital Name" htmlFor="hospitalName">
          <Input
            id="hospitalName"
            name="hospitalName"
            value={formData.hospitalName}
            onChange={handleChange}
            placeholder="e.g. Saint Mary's Medical Center"
          />
        </FormField>

        <FormField label="Address" htmlFor="address">
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter physical street address"
          />
        </FormField>

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
            onChange={(file) => setFormData((p) => ({ ...p, document: file }))}
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
