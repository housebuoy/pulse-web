"use client";

// Single onboarding route — the step lives in ?step=, not the path, so the
// flow is deep-linkable, survives a refresh (paired with the persisted
// store, see store/use-onboarding-store.ts), and the back button naturally
// steps backward since each transition is a router.push (new history entry).
//
// Gated behind a mock approval token (lib/mock/access-request.ts). The
// token normally arrives once, as ?token= on the link a real approval
// email would contain (see the request-access confirmation screen's
// preview link) — visiting it persists approval so later step navigation
// (which doesn't carry ?token=) still passes the gate. Hitting /onboarding
// with no token and no prior approval bounces to /request-access. Already
// having a session (already onboarded) bounces to that role's home instead.
//
// Facility identity (name, logo, region, address, HeFRA) AND the admin's
// email are captured and verified on /request-access, before approval —
// requester === admin, one person, one email, verified once. These two
// steps only add what's left: departments/operations and the
// administrator's account details (name, password) — no email step here.

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthState } from "@/hooks/use-workspace-session";
import { useOnboardingApproval } from "@/hooks/use-access-request";
import {
  MOCK_ADMIN_SESSION,
  finalizeLogin,
  markDeviceTrusted,
  roleHome,
  tokenForSession,
} from "@/lib/mock/auth";
import {
  clearApprovalToken,
  clearRequestEmail,
  getRequestEmail,
} from "@/lib/mock/access-request";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { DepartmentsStep } from "@/components/onboarding/steps/departments-step";
import { AdminStep } from "@/components/onboarding/steps/admin-step";

type OnboardingStep = "departments" | "admin";
const STEPS: OnboardingStep[] = ["departments", "admin"];

function OnboardingBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isResolved: sessionResolved } = useAuthState();
  const tokenParam = searchParams.get("token");
  const { approved, isResolved: approvalResolved } = useOnboardingApproval(tokenParam);
  const isResolved = sessionResolved && approvalResolved;
  const updateOnboardingData = useOnboardingStore((state) => state.updateData);
  const resetOnboarding = useOnboardingStore((state) => state.reset);

  const stepParam = searchParams.get("step");
  const step: OnboardingStep = STEPS.includes(stepParam as OnboardingStep)
    ? (stepParam as OnboardingStep)
    : "departments";

  useEffect(() => {
    // Don't act on the placeholder "no session / not approved" defaults
    // before the real client-side read lands — see the note in
    // hooks/use-workspace-session.ts for why that's not just paranoia.
    if (!isResolved) return;
    if (session) {
      router.replace(roleHome(session.role));
    } else if (!approved) {
      router.replace("/request-access");
    }
  }, [isResolved, session, approved, router]);

  useEffect(() => {
    // Seed the admin's email from the already-verified request the moment
    // approval resolves — AdminStep only displays it, it never re-collects
    // it. Idempotent (same value every run), so safe on every mount/step
    // change, not just the first.
    if (!isResolved || session || !approved) return;
    updateOnboardingData({ adminEmail: getRequestEmail() ?? "" });
  }, [isResolved, session, approved, updateOnboardingData]);

  if (!isResolved || session || !approved) return null;

  const goTo = (next: OnboardingStep) => router.push(`/onboarding?step=${next}`);

  const finishOnboarding = () => {
    // Mock: completing the admin step is this new facility's first
    // sign-in — establish a real session (this demo's one seeded admin
    // identity) so /d's RequireRole guard lets them straight through, then
    // clear the one-time signup state. Email was already verified on
    // /request-access, so there's no separate verify-email step to land on.
    finalizeLogin(tokenForSession(MOCK_ADMIN_SESSION));
    markDeviceTrusted();
    clearApprovalToken();
    clearRequestEmail();
    resetOnboarding();
    router.push("/d/overview");
  };

  switch (step) {
    case "admin":
      return <AdminStep onNext={finishOnboarding} />;
    case "departments":
    default:
      return <DepartmentsStep onNext={() => goTo("admin")} />;
  }
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingBody />
    </Suspense>
  );
}
