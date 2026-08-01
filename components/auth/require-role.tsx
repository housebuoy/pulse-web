"use client";

// Frontend-level route guard. Real enforcement is Spring Boot (RBAC on
// every endpoint, per BACKEND_SPEC.md §7.2) — this only prevents an
// unauthenticated or wrong-role user from seeing a flash of the wrong
// app's chrome before a real backend would reject their requests anyway.

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/hooks/use-workspace-session";
import { roleHome } from "@/lib/mock/auth";
import type { SessionRole } from "@/lib/types/auth";

export function RequireRole({
  allow,
  children,
}: {
  allow: SessionRole[];
  children: ReactNode;
}) {
  const router = useRouter();
  const { session, isResolved } = useAuthState();

  const authorized = !!session && allow.includes(session.role);

  useEffect(() => {
    // Not resolved yet — the default "no session" is a placeholder, not a
    // real answer. Acting on it here would redirect a genuinely
    // authenticated user to /login before the real read lands (see the
    // note in hooks/use-workspace-session.ts).
    if (!isResolved) return;
    if (!session) {
      router.replace("/login");
    } else if (!allow.includes(session.role)) {
      // e.g. a doctor hitting /d, or an admin hitting /w — send them home.
      router.replace(roleHome(session.role));
    }
  }, [isResolved, session, allow, router]);

  // Blank frame while resolving/redirecting, rather than flashing the
  // protected content (or the wrong workspace's shell) for a tick.
  if (!isResolved || !authorized) return null;

  return <>{children}</>;
}
