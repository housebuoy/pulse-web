"use client";

// One login for the whole facility — admins and doctors share this form.
// Role comes from the account (lib/mock/auth.ts), never a picker: on
// success we redirect to roleHome(session.role) — /d for admin, /w for
// doctor. OTP is a second step, wired only for a new/unrecognized device
// (see the DECISION comment on isDeviceTrusted in lib/mock/auth.ts).

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { OtpInput } from "@/components/ui/otp-input";
import { ResendTimer } from "@/components/onboarding/resend-timer";
import { FormField } from "@/components/onboarding/form-field";
import { useAuthState } from "@/hooks/use-workspace-session";
import {
  DEMO_PASSWORD,
  finalizeLogin,
  login,
  markDeviceTrusted,
  roleHome,
  verifyLoginOtp,
  type LoginResult,
} from "@/lib/mock/auth";

type Step = "credentials" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { session } = useAuthState();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState<LoginResult | null>(null);

  // Already signed in — bounce straight to the right workspace instead of
  // showing the form again.
  useEffect(() => {
    if (session) {
      router.replace(roleHome(session.role));
    }
  }, [session, router]);

  const handleCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await login({ email, password });
      // Dev-mode convenience: the backend echoes the verification code
      // (otp.dev-mode=true) — surface it here so manual QA doesn't need
      // DevTools/Render logs. Absent when the backend stops echoing.
      if (result.devOtp) {
        toast("Dev OTP", {
          description: (
            <span className="font-mono text-xl font-semibold tracking-[0.3em]">
              {result.devOtp}
            </span>
          ),
          duration: 15_000,
        });
      }
      // 2FA (per-account /settings/2fa): if the backend returned a token
      // directly the account does NOT require OTP — go straight in.
      if (result.token) {
        finalizeLogin(result.token);
        router.replace(roleHome(result.session.role));
        return;
      }
      // Otherwise this account requires the verification code.
      setPending(result);
      setStep("otp");
    } catch (err) {
      setError(backendMessage(err) ?? "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (code.length !== 6 || !pending) return;
    setSubmitting(true);
    setError("");
    try {
      const otp = await verifyLoginOtp(code, email);
      markDeviceTrusted();
      finalizeLogin(otp?.token ?? pending.token);
      router.replace(roleHome(pending.session.role));
    } catch (err) {
      setError(backendMessage(err) ?? "Verification failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Surface the backend's ApiResponse message (e.g. "Invalid verification
  // code. 4 attempts remaining.") instead of the generic axios error text.
  const backendMessage = (err: unknown): string | null =>
    typeof err === "object" && err !== null && "response" in err
      ? ((err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? null)
      : null;

  // Already signed in and about to be redirected — don't flash the form.
  if (session) return null;

  if (step === "otp" && pending) {
    return (
      <>
        <button
          type="button"
          onClick={() => setStep("credentials")}
          className="flex items-center gap-2 text-body-sm text-fg-muted transition-colors hover:text-fg-secondary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mt-10 max-w-sm">
          <h2 className="text-h1 text-fg">Verify it&apos;s you</h2>
          <p className="mt-3 text-body text-fg-muted">
            New device — we sent a 6-digit code to{" "}
            <span className="font-medium text-fg-secondary">{email}</span>.
          </p>

          <form onSubmit={handleOtp} className="mt-8 space-y-5">
            <OtpInput value={code} onChange={setCode} autoFocus />
            <ResendTimer seconds={30} onResend={() => {}} />
            <Button
              type="submit"
              disabled={code.length !== 6 || submitting}
              className="h-12 w-full shadow-brand"
            >
              {submitting ? "Verifying…" : "Verify & sign in"}
            </Button>
          </form>
        </div>
      </>
    );
  }

  return (
    <div className="mt-10 max-w-sm">
      <h2 className="text-h1 text-fg">Sign in to Pulse</h2>
      <p className="mt-3 text-body text-fg-muted">
        Sign In to access your workspace.
      </p>

      <form onSubmit={handleCredentials} className="mt-8 space-y-5">
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@facility.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={error}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        </FormField>

        <Button
          type="submit"
          disabled={!email || !password || submitting}
          className="h-12 w-full shadow-brand"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-8 rounded-lg border border-dashed border-border p-4 text-body-sm text-fg-muted">
        <p className="font-medium text-fg-secondary">Demo accounts (mock only)</p>
        <p className="mt-1">Admin — sarah.jenkins@knust-hospital.test</p>
        <p>Doctor — owusu@pulsehealth.test</p>
        <p className="mt-1">
          Password —{" "}
          <span className="font-mono text-fg-secondary">{DEMO_PASSWORD}</span>
        </p>
      </div>
    </div>
  );
}
