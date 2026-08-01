"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { ResendTimer } from "@/components/onboarding/resend-timer";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import {
  MOCK_ADMIN_SESSION,
  finalizeLogin,
  markDeviceTrusted,
  tokenForSession,
} from "@/lib/mock/auth";
import { clearApprovalToken } from "@/lib/mock/access-request";

export function VerifyEmailStep() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const adminEmail = useOnboardingStore((state) => state.data.adminEmail);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const email = adminEmail || "your email";

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    // Mock: any 6-digit code passes, same convention as /activate. This is
    // this new facility's first sign-in — establish a real session (this
    // demo's one seeded admin identity) so /d's RequireRole guard lets them
    // straight through, then clear the one-time signup state.
    finalizeLogin(tokenForSession(MOCK_ADMIN_SESSION));
    markDeviceTrusted();
    clearApprovalToken();
    resetOnboarding();
    router.push("/d/overview");
  };

  const handleResend = () => {};

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
        <h2 className="text-h1 text-fg">Verify your email</h2>
        <p className="mt-3 text-body text-fg-muted">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-fg-secondary">{email}</span>. Enter
          it below to confirm your account.
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          <OtpInput value={code} onChange={setCode} autoFocus />
          <ResendTimer seconds={30} onResend={handleResend} />
          <Button type="submit" disabled={code.length !== 6} className="h-12 w-full shadow-brand">
            Verify
          </Button>
        </form>
      </div>
    </>
  );
}
