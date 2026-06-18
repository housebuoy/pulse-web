"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/onboarding/step-progress";
import { StepHeader } from "@/components/onboarding/step-header";
import { FormField } from "@/components/onboarding/form-field";
import { MultiSelect } from "@/components/ui/multi-select";
import { DEPARTMENTS } from "@/lib/constants";
import {
  OperatingHours,
  type OperatingHoursValue,
} from "@/components/onboarding/operating-hours";

export default function FacilityOperations() {
  const router = useRouter();
const [formData, setFormData] = useState({
    phone: "",
    email: "",
    specialties: [] as string[],
    capacity: "500",
    duration: "20",
    
    // THE FIX: Update this block to match the new interface
    operatingHours: {
      alwaysOpen: false,
      schedules: [
        {
          id: "default-1", // Use a static string here to prevent hydration errors on reload
          days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
          open: "08:00",
          close: "17:00",
        },
      ],
    },
  });

  const set = (key: keyof typeof formData, val: unknown) =>
    setFormData((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // persist, then:
    router.push("/onboarding/admin");
  };

  return (
    <>
      <StepProgress current={2} onBack={() => router.back()} />
      <StepHeader
        title="How does your facility operate?"
        description="Configure your public-facing operational details."
      />

      <form onSubmit={handleSubmit} className="mt-10 flex-1 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <FormField label="Public Contact Phone" htmlFor="phone">
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </FormField>
          <FormField label="Public Facility Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="contact@facility.com"
            />
          </FormField>
        </div>

        <FormField label="Specialties Offered" htmlFor="specialties">
          <MultiSelect
            id="specialties"
            value={formData.specialties}
            onChange={(v) => set("specialties", v)}
            options={DEPARTMENTS}
            placeholder="Click to add department…"
            searchPlaceholder="Search departments…"
            emptyText="No departments found."
            allowCustom
          />
        </FormField>

        <div className="grid grid-cols-2 gap-6">
          <FormField label="Daily Patient Capacity" htmlFor="capacity">
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder="500"
            />
          </FormField>
          <FormField label="Consult Duration" htmlFor="consultDuration">
            <div className="relative flex w-full items-center">
              <Input
                id="consultDuration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="15"
                className="pr-20"
              />
              <span className="pointer-events-none absolute right-4 text-body text-fg-muted">
                minutes
              </span>
            </div>
          </FormField>
        </div>

        <FormField label="Operating Hours" htmlFor="operatingHours">
          <OperatingHours
            value={formData.operatingHours}
            onChange={(v) => set("operatingHours", v)}
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
