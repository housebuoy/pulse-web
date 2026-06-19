"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { ResendTimer } from "@/components/onboarding/resend-timer";

export default function VerifyEmail() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const email = "admin@facility.com"; // pull from your onboarding store

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    // verify call → then continue (welcome / dashboard)
  };

  const handleResend = () => {
    // trigger resend
  };

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
          <span className="font-medium text-fg-secondary">{email}</span>. Enter it below to confirm your account.
        </p>

        <form onSubmit={handleVerify} className="mt-8 space-y-5">
          <OtpInput value={code} onChange={setCode} autoFocus />
          <ResendTimer seconds={30} onResend={handleResend} />
          <Button type="submit" disabled={code.length !== 6} className="h-12 w-full shadow-brand">
            Verify
          </Button>
        </form>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 text-body-sm text-fg-muted hover:text-fg-secondary"
        >
          Wrong email address? <span className="text-brand">Go back</span>
        </button>
      </div>
    </>
  );
}
