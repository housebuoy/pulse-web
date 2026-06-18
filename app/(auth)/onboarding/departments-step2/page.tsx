"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StepProgress } from "@/components/onboarding/step-progress";
import { StepHeader } from "@/components/onboarding/step-header";
import { FormField } from "@/components/onboarding/form-field";
import { MultiSelect } from "@/components/ui/multi-select";
import { DEPARTMENTS } from "@/lib/constants";

const DURATIONS = ["10", "15", "20", "30", "45", "60"];

export default function FacilityOperations() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    specialties: [] as string[],
    capacity: "",
    consultDuration: "20",
  });

  const set = (key: keyof typeof formData, val: unknown) =>
    setFormData((p) => ({ ...p, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // persist, then:
    router.push("/onboarding/review");
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
            <Input id="phone" value={formData.phone}
              onChange={(e) => set("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
          </FormField>
          <FormField label="Public Facility Email" htmlFor="email">
            <Input id="email" type="email" value={formData.email}
              onChange={(e) => set("email", e.target.value)} placeholder="contact@facility.com" />
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
            <Input id="capacity" type="number" value={formData.capacity}
              onChange={(e) => set("capacity", e.target.value)} placeholder="500" />
          </FormField>
          <FormField label="Consult Duration" htmlFor="consultDuration">
            <Select  value={formData.consultDuration} onValueChange={(v) => set("consultDuration", v)}>
              <SelectTrigger className="h-12 rounded-sm border-border bg-surface text-body">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((d) => (
                  <SelectItem key={d} value={d}>{d} minutes</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="pt-6">
          <Button type="submit" className="ml-auto flex h-12 w-32 shadow-brand">
            Next Step
          </Button>
        </div>
      </form>
    </>
  );
}