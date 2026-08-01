"use client";

// Single onboarding route — the step lives in ?step=, not the path, so the
// flow is deep-linkable, survives a refresh (paired with the persisted
// store, see store/use-onboarding-store.ts), and the back button naturally
// steps backward since each transition is a router.push (new history entry).
//
// Gated behind a mock approval token (lib/mock/access-request.ts): hitting
// this directly without one bounces to /request-access. Already having a
// session (already onboarded) bounces to that role's home instead.

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthState } from "@/hooks/use-workspace-session";
import { useOnboardingApproval } from "@/hooks/use-access-request";
import { roleHome } from "@/lib/mock/auth";
import { FacilitySetupStep } from "@/components/onboarding/steps/facility-setup-step";
import { DepartmentsStep } from "@/components/onboarding/steps/departments-step";
import { AdminStep } from "@/components/onboarding/steps/admin-step";
import { VerifyEmailStep } from "@/components/onboarding/steps/verify-email-step";

type OnboardingStep = "facility-setup" | "departments" | "admin" | "verify-email";
const STEPS: OnboardingStep[] = ["facility-setup", "departments", "admin", "verify-email"];

function OnboardingBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isResolved: sessionResolved } = useAuthState();
  const { approved, isResolved: approvalResolved } = useOnboardingApproval();
  const isResolved = sessionResolved && approvalResolved;

  const stepParam = searchParams.get("step");
  const step: OnboardingStep = STEPS.includes(stepParam as OnboardingStep)
    ? (stepParam as OnboardingStep)
    : "facility-setup";

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

  if (!isResolved || session || !approved) return null;

  const goTo = (next: OnboardingStep) => router.push(`/onboarding?step=${next}`);

  switch (step) {
    case "departments":
      return <DepartmentsStep onNext={() => goTo("admin")} />;
    case "admin":
      return <AdminStep onNext={() => goTo("verify-email")} />;
    case "verify-email":
      return <VerifyEmailStep />;
    case "facility-setup":
    default:
      return <FacilitySetupStep onNext={() => goTo("departments")} />;
  }
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingBody />
    </Suspense>
  );
}
