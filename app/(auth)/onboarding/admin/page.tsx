"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/ui/password-input";
import { ImageUpload } from "@/components/ui/image-upload";
import { StepProgress } from "@/components/onboarding/step-progress";
import { StepHeader } from "@/components/onboarding/step-header";
import { FormField } from "@/components/onboarding/form-field";
import { useOnboardingStore } from "@/store/use-onboarding-store";

export default function AdminAccount() {
  const router = useRouter();
  const onboardingData = useOnboardingStore((state) => state.data);

  // 1. Added confirmPassword to the initial state
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  // Avatar URL is local state — not stored in the onboarding store because
  // it's an object URL that only lives in this browser session.
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // 2. Added local state to handle the password mismatch error
  const [passwordError, setPasswordError] = useState("");

  const set = (k: keyof typeof form, v: unknown) => {
    setForm((p) => ({ ...p, [k]: v }));
    // Clear the error as soon as the user starts typing again
    if (k === "confirmPassword" || k === "password") {
      setPasswordError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 3. Catch the mismatch before doing anything else
    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (!form.agreed) return;

    const payload = { ...onboardingData, ...form };

    // TODO: create account, then router.push("/dashboard")
    console.log("Account created successfully", payload);
  };

  return (
    <>
      <StepProgress current={3} onBack={() => router.back()} />
      <StepHeader
        title="Create administrator account"
        description="This account will manage staff, doctors, and system settings."
      />

      <form onSubmit={handleSubmit} className="mt-10 flex-1 space-y-6">
        <ImageUpload
          value={avatarUrl}
          onChange={setAvatarUrl}
          shape="circle"
          size={80}
          label="Profile photo (optional)"
        />

        <FormField label="Administrator Full Name" htmlFor="fullName">
          <Input id="fullName" value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)} placeholder="e.g. Dr. Sarah Jenkins" required />
        </FormField>

        <div className="grid grid-cols-2 gap-6">
          <FormField label="Admin Phone" htmlFor="phone">
            <Input id="phone" value={form.phone}
              onChange={(e) => set("phone", e.target.value)} placeholder="+233 24 XXX XXXX" required />
          </FormField>
          <FormField label="Admin Email" htmlFor="email">
            <Input id="email" type="email" value={form.email}
              onChange={(e) => set("email", e.target.value)} placeholder="admin@facility.com" required />
          </FormField>
        </div>

        {/* Password Fields stacked vertically */}
        <div className="space-y-6">
          <FormField label="Secure Password" htmlFor="password">
            <PasswordInput id="password" value={form.password}
              onChange={(e) => set("password", e.target.value)} placeholder="••••••••" required />
            <p className="text-caption text-fg-muted">
              Must be at least 8 characters containing a number and symbol.
            </p>
          </FormField>

          {/* 4. The new Confirm Password field mapped to the error prop */}
          <FormField label="Confirm Password" htmlFor="confirmPassword" error={passwordError}>
            <PasswordInput id="confirmPassword" value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)} placeholder="••••••••" required />
          </FormField>
        </div>

        <div className="flex items-start gap-3 pt-2">
          <Checkbox id="terms" checked={form.agreed}
            onCheckedChange={(c) => set("agreed", c === true)} className="mt-0.5" />
          <label htmlFor="terms" className="text-body-sm text-fg-secondary">
            I agree to the Pulse{" "}
            <Link href="#" className="text-brand hover:underline">Terms of Service</Link> and{" "}
            <Link href="#" className="text-brand hover:underline">Privacy Policy</Link>.
          </label>
        </div>

        <div className="py-6">
          <Button type="submit" disabled={!form.agreed} className="ml-auto flex h-12 px-8 shadow-brand">
            Complete Registration
          </Button>
        </div>
      </form>
    </>
  );
}