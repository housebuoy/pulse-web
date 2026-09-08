"use client";

// Gates /onboarding on a mock approval token — see lib/mock/access-request.ts.
// Same useState+effect shape as hooks/use-workspace-session.ts's
// useAuthState, and for the same reason: useSyncExternalStore's
// hydration-mismatch self-correction is not guaranteed to land before a
// consuming effect runs, so a redirect-on-"not approved" effect can fire
// on the transiently-wrong default and navigate away before the real
// value arrives. `isResolved` lets the caller wait for the real read.

import { useEffect, useState } from "react";
import {
  getApprovalToken,
  isValidApprovalToken,
  storeApprovalToken,
} from "@/lib/mock/access-request";

export interface AccessRequestState {
  approved: boolean;
  isResolved: boolean;
}

/**
 * @param tokenFromUrl The `?token=` query param off /onboarding, this
 * demo's stand-in for a clicked email-approval link. When present and
 * valid it's persisted (mirroring a real backend verifying the link and
 * establishing approval) before approval state is read, so the caller
 * sees `approved: true` in the same resolution pass rather than one
 * render later.
 */
export function useOnboardingApproval(tokenFromUrl?: string | null): AccessRequestState {
  const [approved, setApproved] = useState(false);
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    if (tokenFromUrl && isValidApprovalToken(tokenFromUrl)) {
      storeApprovalToken(tokenFromUrl);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApproved(!!getApprovalToken());
    setIsResolved(true);

    function onStorage(e: StorageEvent) {
      if (e.key === "pulse_onboarding_token") {
        setApproved(!!getApprovalToken());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [tokenFromUrl]);

  return { approved, isResolved };
}
