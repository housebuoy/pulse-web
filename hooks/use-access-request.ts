"use client";

// Gates /onboarding on a mock approval token — see lib/mock/access-request.ts.
// Same useSyncExternalStore pattern as hooks/use-workspace-session.ts, for
// the same reason: localStorage is an external store that can differ
// between server and client, and this reads it synchronously on the first
// client render rather than via a setState-in-effect.

import { useSyncExternalStore } from "react";
import { getApprovalToken } from "@/lib/mock/access-request";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getServerSnapshot(): string | null {
  return null;
}

export function useIsOnboardingApproved(): boolean {
  const token = useSyncExternalStore(subscribe, getApprovalToken, getServerSnapshot);
  return !!token;
}
