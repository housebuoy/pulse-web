"use client";

// Facility staff (admin or doctor) reset against their WORK EMAIL — the
// same address they sign in with. This is deliberately email-only: the
// patient-facing mobile app resets by phone + SMS, and that flow shares
// nothing with this one.
//
// Two steps live here (email → code) because they're one continuous
// "prove you own this inbox" exchange, the same shape /login and
// /request-access already use for their OTP second step. Setting the
// password is a separate route (/new-password) since it's gated on a
// different credential — the reset token this page's verify step issues.
//
// Nothing here logs anyone in. On success the user signs in normally, so
// roleHome() still decides /d vs /w — see /new-password.

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpInput } from "@/components/ui/otp-input";
import { ResendTimer } from "@/components/onboarding/resend-timer";
import { FormField } from "@/components/onboarding/form-field";
import {
  requestPasswordReset,
  storeResetToken,
  verifyResetCode,
} from "@/lib/mock/auth";

type Step = "email" | "code";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Enter a valid work email address.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await requestPasswordReset(trimmed);
      // Always advances, even for an address with no account — the
      // endpoint must not confirm which work emails exist. See
      // requestPasswordReset in lib/mock/auth.ts.
      setEmail(trimmed);
      setStep("code");
    } catch (err) {
      setError(backendMessage(err) ?? "Couldn't send the code. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setError("");
    setSubmitting(true);
    try {
      const { resetToken } = await verifyResetCode(email, code);
      // Hand the verified token to /new-password — it's the only thing
      // that authorizes the next step.
      storeResetToken(resetToken, email);
      router.push("/new-password");
    } catch (err) {
      setError(backendMessage(err) ?? "That code isn't right. Try again.");
      setSubmitting(false);
    }
  };

  const handleResend = () => {
    void requestPasswordReset(email);
    setCode("");
    setError("");
  };

  // Same helper as /login — surface the backend's ApiResponse message
  // (e.g. "Code expired. Request a new one.") over the axios error text.
  const backendMessage = (err: unknown): string | null =>
    typeof err === "object" && err !== null && "response" in err
      ? ((err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? null)
      : null;

  if (step === "code") {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setError("");
          }}
          className="flex items-center gap-2 text-body-sm text-fg-muted transition-colors hover:text-fg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mt-10 max-w-sm">
          <h2 className="text-h1 text-fg">Enter your reset code</h2>
          <p className="mt-3 text-body text-fg-muted">
            If that email belongs to a Pulse account, we sent a 6-digit code to{" "}
            <span className="font-medium text-fg-secondary">{email}</span>.
          </p>

          <form onSubmit={handleVerify} className="mt-8 space-y-5">
            <OtpInput
              value={code}
              onChange={(v) => {
                setCode(v);
                setError("");
              }}
              autoFocus
            />
            {error && <p className="text-caption text-destructive">{error}</p>}
            <ResendTimer seconds={30} onResend={handleResend} />
            <Button
              type="submit"
              disabled={code.length !== 6 || submitting}
              className="h-12 w-full shadow-brand"
            >
              {submitting ? "Verifying…" : "Verify code"}
            </Button>
          </form>

          <Link
            href="/login"
            className="mt-8 block text-body-sm text-fg-muted hover:text-fg-secondary"
          >
            Back to sign in
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="flex items-center gap-2 text-body-sm text-fg-muted transition-colors hover:text-fg-secondary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>

      <div className="mt-10 max-w-sm">
        <h2 className="text-h1 text-fg">Reset your password</h2>
        <p className="mt-3 text-body text-fg-muted">
          Enter the work email you sign in with and we&apos;ll send you a
          6-digit verification code.
        </p>

        <form onSubmit={handleRequest} className="mt-8 space-y-5">
          <FormField label="Work email" htmlFor="email" error={error}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              placeholder="you@facility.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
          </FormField>

          <Button
            type="submit"
            disabled={!email || submitting}
            className="h-12 w-full shadow-brand"
          >
            {submitting ? "Sending code…" : "Send reset code"}
          </Button>
        </form>

        <p className="mt-8 text-body-sm text-fg-muted">
          Don&apos;t have an account?{" "}
          <Link href="/request-access" className="text-brand hover:underline">
            Request access
          </Link>
        </p>
      </div>
    </>
  );
}
