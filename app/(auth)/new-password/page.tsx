"use client";

// Final step of the facility password reset (/forgot-password → code →
// here). Its own route rather than a third step on that page because it's
// authorized by a different credential: the reset token issued by
// verifyResetCode, not the email in a form field. Reaching it without one
// — a direct visit, a refresh after the token was spent — bounces back to
// the start rather than showing a form that can't submit.
//
// Deliberately does NOT establish a session. The user signs in again
// afterwards, which keeps the one role redirect (roleHome → /d for admin,
// /w for doctor) as the only place that decision is made, and matches what
// a real backend should do here: invalidate the reset token and every
// existing session for that account.

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/onboarding/form-field";
import {
  PasswordStrength,
  isPasswordValid,
} from "@/components/auth/password-strength";
import { clearResetToken, getResetToken, resetPassword } from "@/lib/mock/auth";

export default function NewPasswordPage() {
  const router = useRouter();

  // Read once on mount — sessionStorage isn't available during the server
  // render, so null here means "not read yet", not "no token".
  const [reset, setReset] = useState<{ token: string; email: string } | null>(
    null,
  );
  const [resolved, setResolved] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Same useState+effect shape (and same lint exemption) as
    // hooks/use-workspace-session.ts and hooks/use-access-request.ts, for
    // the same reason: `resolved` has to separate "haven't checked yet"
    // from "checked, no token" so the redirect below can't fire on the
    // placeholder default before the real client-side read lands.
    const stored = getResetToken();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReset(stored);
    setResolved(true);
    if (!stored) router.replace("/forgot-password");
  }, [router]);

  const matches = confirm.length > 0 && password === confirm;
  const canSubmit = isPasswordValid(password) && matches && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reset) return;
    if (!isPasswordValid(password)) {
      setError("Password doesn't meet the requirements above.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await resetPassword(reset.token, password);
      // Single-use — spent whether or not the user goes straight to /login.
      clearResetToken();
      setDone(true);
    } catch (err) {
      setError(
        backendMessage(err) ?? "Couldn't reset your password. Try again.",
      );
      setSubmitting(false);
    }
  };

  const backendMessage = (err: unknown): string | null =>
    typeof err === "object" && err !== null && "response" in err
      ? ((err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? null)
      : null;

  // Waiting on the token read, or already bouncing to /forgot-password.
  if (!resolved || (!reset && !done)) return null;

  if (done) {
    return (
      <div className="mt-10 max-w-sm">
        <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="size-6 text-success" />
        </div>
        <h2 className="mt-4 text-h1 text-fg">Password updated</h2>
        <p className="mt-3 text-body text-fg-muted">
          Sign in with your new password to get back to your workspace.
        </p>
        <Button asChild className="mt-6 h-12 w-full shadow-brand">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => router.push("/forgot-password")}
        className="flex items-center gap-2 text-body-sm text-fg-muted transition-colors hover:text-fg-secondary"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mt-10 max-w-sm">
        <h2 className="text-h1 text-fg">Set a new password</h2>
        <p className="mt-3 text-body text-fg-muted">
          Choose a new password for{" "}
          <span className="font-medium text-fg-secondary">{reset?.email}</span>.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <FormField label="New password" htmlFor="password">
            <PasswordInput
              id="password"
              autoComplete="new-password"
              required
              autoFocus
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
            <PasswordStrength value={password} />
          </FormField>

          <FormField
            label="Confirm new password"
            htmlFor="confirm"
            error={error}
          >
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError("");
              }}
            />
            {confirm.length > 0 && !matches && !error && (
              <p className="text-caption text-destructive">
                Passwords do not match.
              </p>
            )}
          </FormField>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-12 w-full shadow-brand"
          >
            {submitting ? "Updating…" : "Update password"}
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
