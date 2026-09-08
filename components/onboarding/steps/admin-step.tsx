"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/ui/password-input";
import { ImageUpload } from "@/components/ui/image-upload";
import { StepProgress } from "@/components/onboarding/step-progress";
import { StepHeader } from "@/components/onboarding/step-header";
import { FormField } from "@/components/onboarding/form-field";
import { useOnboardingStore } from "@/store/use-onboarding-store";

export function AdminStep({ onNext }: { onNext: () => void }) {
  const router = useRouter();
  // Already verified on /request-access (requester === admin, one email) —
  // seeded into the store as soon as approval resolves, see
  // app/(auth)/onboarding/page.tsx. Displayed read-only below; never
  // re-collected here.
  const email = useOnboardingStore((state) => state.data.adminEmail);

  // Password is deliberately kept local-only — never written to the
  // onboarding store (and therefore never to sessionStorage), even though
  // that means it doesn't survive a refresh on this step.
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  // Avatar URL is local state — not stored in the onboarding store because
  // it's an object URL that only lives in this browser session.
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [passwordError, setPasswordError] = useState("");

  const set = (k: keyof typeof form, v: unknown) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (k === "confirmPassword" || k === "password") {
      setPasswordError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (!form.agreed) return;

    onNext();
  };

  return (
    <>
      <StepProgress current={2} total={2} onBack={() => router.back()} />
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

        <FormField label="Admin Phone" htmlFor="phone">
          <Input id="phone" value={form.phone}
            onChange={(e) => set("phone", e.target.value)} placeholder="+233 24 XXX XXXX" required />
        </FormField>

        <FormField label="Admin Email" htmlFor="email">
          <div className="relative">
            <Input id="email" type="email" value={email} disabled className="pr-10" />
            <CheckCircle2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-success" />
          </div>
          <p className="text-caption text-fg-muted">
            Verified when you requested access.
          </p>
        </FormField>

        <div className="space-y-6">
          <FormField label="Secure Password" htmlFor="password">
            <PasswordInput id="password" value={form.password}
              onChange={(e) => set("password", e.target.value)} placeholder="••••••••" required />
            <p className="text-caption text-fg-muted">
              Must be at least 8 characters containing a number and symbol.
            </p>
          </FormField>

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
