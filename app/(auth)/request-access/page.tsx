"use client";

// Public entry point for a facility that doesn't have a Pulse account yet.
// Submitting stores a mock approval token (lib/mock/access-request.ts) that
// gates /onboarding — see that page for the real approval flow this stands
// in for.

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SingleSelect } from "@/components/ui/single-select";
import { FormField } from "@/components/onboarding/form-field";
import { REGIONS } from "@/lib/constants";
import { storeApprovalToken, submitAccessRequest } from "@/lib/mock/access-request";

const REGION_OPTIONS = REGIONS.map((r) => ({ label: r, value: r }));

interface FormValues {
  facilityName: string;
  contactName: string;
  email: string;
  phone: string;
  region: string;
}

const INITIAL: FormValues = {
  facilityName: "",
  contactName: "",
  email: "",
  phone: "",
  region: "",
};

export default function RequestAccessPage() {
  const [form, setForm] = useState<FormValues>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { token } = await submitAccessRequest(form);
    storeApprovalToken(token);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mt-10 max-w-sm">
        <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="size-6 text-success" />
        </div>
        <h2 className="mt-4 text-h1 text-fg">Request received</h2>

        <div className="mt-4 space-y-3 text-body text-fg-muted">
          <p>We&apos;ll review your request and notify you by email.</p>
          <p>A valid HeFRA license/document is still required after approval.</p>
          <p>
            If it isn&apos;t submitted within the grace period, your workspace
            will be suspended until you provide it.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-dashed border-border p-4 text-body-sm text-fg-muted">
          <p className="font-medium text-fg-secondary">Demo only</p>
          <p className="mt-1">
            Real approval happens by email. To preview the setup flow now:
          </p>
          <Button asChild className="mt-3 h-10 w-full">
            <Link href="/onboarding">Preview facility setup</Link>
          </Button>
        </div>

        <Link
          href="/login"
          className="mt-6 block text-center text-body-sm text-fg-muted hover:text-fg-secondary"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 max-w-sm">
      <h2 className="text-h1 text-fg">Request access</h2>
      <p className="mt-3 text-body text-fg-muted">
        Tell us about your facility and we&apos;ll set up your Pulse
        workspace.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <FormField label="Facility name" htmlFor="facilityName">
          <Input
            id="facilityName"
            required
            value={form.facilityName}
            onChange={(e) => set("facilityName", e.target.value)}
            placeholder="e.g. Saint Mary's Medical Center"
          />
        </FormField>

        <FormField label="Your name" htmlFor="contactName">
          <Input
            id="contactName"
            required
            value={form.contactName}
            onChange={(e) => set("contactName", e.target.value)}
            placeholder="e.g. Dr. Sarah Jenkins"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-6">
          <FormField label="Work email" htmlFor="email">
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@facility.com"
            />
          </FormField>
          <FormField label="Phone" htmlFor="phone">
            <Input
              id="phone"
              required
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+233 24 XXX XXXX"
            />
          </FormField>
        </div>

        <FormField label="Region" htmlFor="region">
          <SingleSelect
            value={form.region}
            onChange={(v) => set("region", v)}
            options={REGION_OPTIONS}
            placeholder="Select region"
            searchPlaceholder="Search regions…"
            emptyText="No regions found."
          />
        </FormField>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full shadow-brand"
        >
          {submitting ? "Submitting…" : "Request access"}
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-6 block text-body-sm text-fg-muted hover:text-fg-secondary"
      >
        Already have an account? <span className="text-brand">Sign in</span>
      </Link>
    </div>
  );
}
