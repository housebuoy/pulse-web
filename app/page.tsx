"use client";

// Public landing page. Logged-in visitors never see this content — they're
// bounced onward to their role's home (/d or /w) the instant a session
// resolves. Unauthenticated visitors get a hero with the two entry points:
// existing users sign in, new facilities request access.
// Reuses the same brand tokens/copy as components/auth/brand-panel.tsx
// (the (auth) layout's split-screen panel) but as a full-bleed hero rather
// than a half-width sidebar, since this route sits outside the (auth) group.

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/use-workspace-session";
import { roleHome } from "@/lib/mock/auth";

export default function LandingPage() {
  const router = useRouter();
  const { session } = useAuthState();

  useEffect(() => {
    if (session) router.replace(roleHome(session.role));
  }, [session, router]);

  // Already signed in and about to be redirected — don't flash the hero.
  if (session) return null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-brand text-white">
      <div
        className="absolute inset-0 bg-brand/90 mix-blend-multiply"
        style={{
          backgroundImage: 'url("/assets/images/onboarding/background.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.2,
        }}
      />

      <div className="relative z-10 flex flex-1 flex-col">
        <header className="flex items-center justify-between px-8 py-8 lg:px-16">
          <div className="flex items-center gap-2 font-wordmark text-wordmark">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand">
              <Activity className="h-6 w-6" />
            </div>
            Pulse Health
          </div>
          <div className="hidden items-center gap-2 text-eyebrow uppercase text-brand-accent sm:flex">
            <ShieldCheck className="h-4 w-4" />
            Secure Session • Pulse Health Identity Service
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-eyebrow uppercase text-brand-accent backdrop-blur-sm">
            Enterprise Edition v1.0
          </span>
          <h1 className="mb-6 max-w-3xl text-hero">Eliminate the Waiting Room</h1>
          <p className="mb-10 max-w-xl text-body-lg text-white/80">
            Seamless patient flow, automated scheduling, and real-time queue
            management in one intelligent platform.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 bg-white px-8 text-brand hover:bg-white/90">
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white/30 bg-transparent px-8 text-white hover:bg-white/10"
            >
              <Link href="/request-access">Request access</Link>
            </Button>
          </div>
        </main>

        <footer className="px-8 py-8 text-center text-body-sm text-white/60 lg:px-16">
          Built for modern, high-efficiency healthcare facilities.
        </footer>
      </div>
    </div>
  );
}
