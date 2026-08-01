"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { OtpInput } from "@/components/ui/otp-input";
import { ResendTimer } from "@/components/onboarding/resend-timer";
import { FormField } from "@/components/onboarding/form-field";
import {
  MOCK_DOCTOR_SESSION,
  finalizeLogin,
  markDeviceTrusted,
  tokenForSession,
} from "@/lib/mock/auth";

type Step = "otp" | "password" | "done";

// In the real flow this comes from the invite token query param.
const INVITE_EMAIL = "owusu@pulsehealth.test";
const INVITE_NAME = "Dr. Owusu";
const FACILITY_NAME = "KNUST University Hospital";

export default function ActivatePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("otp");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    // Mock: any 6-digit code passes.
    setStep("password");
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setConfirmError("Passwords do not match.");
      return;
    }
    setStep("done");
  };

  if (step === "done") {
    return (
      <div className="mt-10 max-w-sm">
        <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="size-6 text-success" />
        </div>
        <h2 className="mt-4 text-h1 text-fg">You&apos;re in!</h2>
        <p className="mt-2 text-body text-fg-muted">
          Your account at <span className="font-medium text-fg-secondary">{FACILITY_NAME}</span> is active.
        </p>
        <Button
          className="mt-6 h-12 w-full shadow-brand"
          onClick={() => {
            // The invite/OTP/password steps above are this account's first
            // sign-in — establish the same session login() would, so /w's
            // RequireRole guard lets them straight through.
            finalizeLogin(tokenForSession(MOCK_DOCTOR_SESSION));
            markDeviceTrusted();
            router.push("/w/queue");
          }}
        >
          Open my workspace
        </Button>
      </div>
    );
  }

  if (step === "password") {
    return (
      <>
        <button
          type="button"
          onClick={() => setStep("otp")}
          className="flex items-center gap-2 text-body-sm text-fg-muted transition-colors hover:text-fg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mt-10 max-w-sm">
          <h2 className="text-h1 text-fg">Set your password</h2>
          <p className="mt-3 text-body text-fg-muted">
            Create a secure password for your <span className="font-medium text-fg-secondary">{FACILITY_NAME}</span> account.
          </p>

          <form onSubmit={handleSetPassword} className="mt-8 space-y-5">
            <FormField label="Password" htmlFor="password">
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setConfirmError("");
                }}
                placeholder="••••••••"
                required
              />
              <p className="text-caption text-fg-muted">
                At least 8 characters with a number and symbol.
              </p>
            </FormField>

            <FormField label="Confirm password" htmlFor="confirm" error={confirmError}>
              <PasswordInput
                id="confirm"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setConfirmError("");
                }}
                placeholder="••••••••"
                required
              />
            </FormField>

            <Button
              type="submit"
              disabled={!password || !confirm}
              className="h-12 w-full shadow-brand"
            >
              Activate account
            </Button>
          </form>
        </div>
      </>
    );
  }

  // step === "otp"
  return (
    <>
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-body-sm text-fg-muted transition-colors hover:text-fg-secondary"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mt-10 max-w-sm">
        <h2 className="text-h1 text-fg">Activate your account</h2>
        <p className="mt-3 text-body text-fg-muted">
          Welcome, <span className="font-medium text-fg-secondary">{INVITE_NAME}</span>. We sent a
          verification code to{" "}
          <span className="font-medium text-fg-secondary">{INVITE_EMAIL}</span>.
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          <OtpInput value={code} onChange={setCode} autoFocus />
          <ResendTimer seconds={30} onResend={() => {}} />
          <Button
            type="submit"
            disabled={code.length !== 6}
            className="h-12 w-full shadow-brand"
          >
            Verify email
          </Button>
        </form>
      </div>
    </>
  );
}
