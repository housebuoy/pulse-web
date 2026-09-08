"use client";

// Public entry point for a facility that doesn't have a Pulse account yet.
// Also the full facility-profile capture — /onboarding no longer has a
// facility-setup step; departments → admin only add operational detail on
// top of what's collected here.
//
// Requester === admin — one person, one email — so email verification
// happens once, right here, before the request even exists. Submitting the
// form doesn't create the request; it only triggers the (mock) OTP email.
// submitAccessRequest — what would actually create the pending request
// server-side — doesn't run until OTP succeeds, so an unverified email
// never reaches the operator queue. The mock token issued afterward does
// NOT get stored — approval only takes effect once its link is "clicked"
// (the preview link on the received screen), the same way a real approval
// only takes effect once the emailed link is opened. /onboarding validates
// and stores the token from ?token= — see that page.

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SingleSelect } from "@/components/ui/single-select";
import { ImageUpload } from "@/components/ui/image-upload";
import { OtpInput } from "@/components/ui/otp-input";
import { FormField } from "@/components/onboarding/form-field";
import { FileUpload } from "@/components/onboarding/file-upload";
import { ResendTimer } from "@/components/onboarding/resend-timer";
import { REGIONS } from "@/lib/constants";
import { storeRequestEmail, submitAccessRequest } from "@/lib/mock/access-request";

const REGION_OPTIONS = REGIONS.map((r) => ({ label: r, value: r }));

interface FormValues {
  facilityName: string;
  contactName: string;
  email: string;
  phone: string;
  region: string;
  address: string;
  hefraLicense: string;
  document: File | null;
}

const INITIAL: FormValues = {
  facilityName: "",
  contactName: "",
  email: "",
  phone: "",
  region: "",
  address: "",
  hefraLicense: "",
  document: null,
};

export default function RequestAccessPage() {
  const [form, setForm] = useState<FormValues>(INITIAL);
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [logoError, setLogoError] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ token: string } | null>(null);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    set(name as keyof FormValues, value as FormValues[keyof FormValues]);
  };

  const handlePickLocation = () => {
    // TODO: open map picker (current location / landmark search)
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!logoUrl) {
      setLogoError(true);
      return;
    }
    // Mock: pretend a 6-digit code was just emailed to form.email.
    setShowOtp(true);
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setSubmitting(true);
    const res = await submitAccessRequest({ ...form, logoUrl: logoUrl! });
    storeRequestEmail(form.email);
    setSubmitting(false);
    setResult(res);
  };

  const handleResend = () => {};

  if (result) {
    return (
      <div className="mx-auto mt-10 w-full max-w-lg flex items-center justify-center flex-col">
        <div className="flex size-20 items-center justify-center rounded-full bg-brand/10">
          <CheckCircle2 className="size-10 text-brand" />
        </div>
        <h2 className="mt-4 text-h1 text-fg">Request received</h2>

        <div className="mt-4 space-y-3 text-body text-center text-fg-muted">
          <p>We&apos;ll review your request and notify you by email.</p>
          <p>A valid HeFRA license/document is still required after approval.</p>
          <p>
            If it isn&apos;t submitted within the grace period, your workspace
            will be suspended until you provide it.
          </p>
        </div>
        <Button asChild className="mt-3 h-10 w-full">
          <Link
            href="/login"
            className="mt-6 block text-center text-body-sm text-fg-muted hover:text-fg-secondary"
          >
            Back to sign in
          </Link>
        </Button>

        <div className="mt-8 rounded-lg border border-dashed border-border p-4 text-body-sm text-fg-muted">
          <p className="font-medium text-fg-secondary">Demo only</p>
          <p className="mt-1">
            Real approval happens by email — this link stands in for the one
            you&apos;d receive there:
          </p>
          <Button asChild className="mt-3 h-10 w-full">
            <Link href={`/onboarding?token=${result.token}`}>
              Preview facility setup
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (showOtp) {
    return (
      <div className="mx-auto mt-10 w-full max-w-lg">
        <button
          type="button"
          onClick={() => { setShowOtp(false); setCode(""); }}
          className="flex items-center gap-2 text-body-sm text-fg-muted transition-colors hover:text-fg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mt-10 max-w-sm">
          <h2 className="text-h1 text-fg">Verify your email</h2>
          <p className="mt-3 text-body text-fg-muted">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-fg-secondary">{form.email}</span>.
            Enter it below to submit your request.
          </p>

          <form onSubmit={handleVerify} className="mt-8 space-y-5">
            <OtpInput value={code} onChange={setCode} autoFocus />
            <ResendTimer seconds={30} onResend={handleResend} />
            <Button
              type="submit"
              disabled={code.length !== 6 || submitting}
              className="h-12 w-full shadow-brand"
            >
              {submitting ? "Verifying…" : "Verify"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-lg">
      <h2 className="text-h1 text-fg">Request access</h2>
      <p className="mt-3 text-body text-fg-muted">
        Tell us about your facility and we&apos;ll set up your Pulse workspace.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <ImageUpload
            value={logoUrl ?? null}
            onChange={(url) => {
              setLogoUrl(url ?? undefined);
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

        <FormField label="Facility name" htmlFor="facilityName">
          <Input
            id="facilityName"
            name="facilityName"
            required
            value={form.facilityName}
            onChange={handleChange}
            placeholder="e.g. Saint Mary's Medical Center"
          />
        </FormField>

        <FormField label="Your name" htmlFor="contactName">
          <Input
            id="contactName"
            name="contactName"
            required
            value={form.contactName}
            onChange={handleChange}
            placeholder="e.g. Dr. Sarah Jenkins"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-6">
          <FormField label="Work email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@facility.com"
            />
          </FormField>
          <FormField label="Phone" htmlFor="phone">
            <Input
              id="phone"
              name="phone"
              required
              value={form.phone}
              onChange={handleChange}
              placeholder="+233 24 XXX XXXX"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-6">
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
                value={form.address}
                onChange={handleChange}
                placeholder="Enter physical street address"
                className="pl-9"
              />
            </div>
          </FormField>
        </div>

        <FormField
          label="HeFRA License Number (optional)"
          htmlFor="hefraLicense"
        >
          <Input
            id="hefraLicense"
            name="hefraLicense"
            value={form.hefraLicense}
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
            value={form.document}
            onChange={(file) => set("document", file)}
            accept=".pdf,image/*"
            hint="Optional — speeds up verification. PDF or Image, max 5MB"
          />
        </FormField>

        <Button type="submit" className="h-12 w-full">
          Request access
        </Button>
      </form>

      <Link
        href="/login"
        className="my-6 block text-body-sm text-fg-muted hover:text-fg-secondary"
      >
        Already have an account? <span className="text-brand">Sign in</span>
      </Link>
    </div>
  );
}
