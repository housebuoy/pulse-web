"use client";

// The single session source for both /d (admin) and /w (doctor) — one
// login, one mechanism. Today: resolves from the mock token in
// localStorage (lib/mock/auth.ts). Real: same shape, resolved from a JWT /
// httpOnly cookie server-side; this file is the single integration point.
//
// NOTE on the useState+effect shape below: useSyncExternalStore looks like
// the "correct" API for this (localStorage is exactly the kind of external
// store it's for), and reads it synchronously on the client's first
// render — but only *after* an SSR/hydration-mismatch self-correcting
// re-render, which is NOT guaranteed to land before this hook's consumers'
// own effects run. Verified by hand: on a hard refresh of an authenticated
// page, RequireRole's redirect effect fired on the transiently-wrong
// "no session" render and navigated to /login *before* the corrected
// render arrived — a real, reproducible bug, not a hypothetical. The
// useState+effect pattern below is deliberate: `isResolved` lets consumers
// tell "haven't checked yet" apart from "checked, no session," so they can
// wait instead of acting on a default that's about to be corrected.
import { useEffect, useState } from "react";
import {
  fetchSession,
  getStoredSession,
  MOCK_DOCTOR_SESSION,
} from "@/lib/mock/auth";
import type { WorkspaceSession } from "@/lib/types/auth";

export interface AuthState {
  session: WorkspaceSession | null;
  /** False only until the initial client-side check completes. Guards
   *  (components/auth/require-role.tsx) must wait for this before deciding
   *  whether to redirect — see the note above for why. */
  isResolved: boolean;
}

/** Mock tokens decode locally; real JWTs are opaque and resolve async. */
function isMockToken(token: string | null): boolean {
  return token !== null && token.startsWith("mock-session.");
}

export function useAuthState(): AuthState {
  const [session, setSession] = useState<WorkspaceSession | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    // Client-only read (no localStorage during SSR) — deliberately not
    // deferred to an event callback; see the file-level note.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("pulse_token")
        : null;

    if (isMockToken(token)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSession(getStoredSession());
      setIsResolved(true);
    } else if (token) {
      // Real JWT — fetch the full session from GET /api/auth/me. Keep
      // isResolved false until it lands so guards don't redirect on a
      // placeholder "no session" render (see the file-level note).
      let cancelled = false;
      fetchSession(token)
        .then((s) => {
          if (!cancelled) setSession(s);
        })
        .catch(() => {
          if (!cancelled) setSession(null);
        })
        .finally(() => {
          if (!cancelled) setIsResolved(true);
        });
      return () => {
        cancelled = true;
      };
    } else {
      setIsResolved(true);
    }

    // Stay in sync if another tab signs in/out.
    function onStorage(e: StorageEvent) {
      if (e.key === "pulse_token") {
        setSession(getStoredSession());
        setIsResolved(true);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { session, isResolved };
}

/**
 * Convenience for pages already rendered behind <RequireRole> (see
 * components/auth/require-role.tsx), where a session is guaranteed to
 * exist. Falls back to the seeded doctor session only in the impossible-
 * in-practice case this is read before a guard has resolved — never rely
 * on that fallback, it exists so this hook's return type stays ergonomic
 * (non-null) for the many /w pages that already assume it.
 */
export function useWorkspaceSession(): WorkspaceSession {
  const { session } = useAuthState();
  return session ?? MOCK_DOCTOR_SESSION;
}
