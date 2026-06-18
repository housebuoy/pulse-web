// components/auth/brand-panel.tsx
import { Activity, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandPanel({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand p-12 text-white lg:flex",
        className,
      )}
    >
      {/* Faint surgery background */}
      <div
        className="absolute inset-0 bg-brand/90 mix-blend-multiply"
        style={{
          backgroundImage: 'url("/assets/images/onboarding/background.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.2,
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 font-wordmark text-wordmark">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand">
            <Activity className="h-6 w-6" />
          </div>
          Pulse Health
        </div>

        {/* Hero */}
        <div className="mb-20 max-w-md">
          <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-eyebrow uppercase text-brand-accent backdrop-blur-sm">
            Enterprise Edition v1.0
          </span>
          <h1 className="mb-6 text-hero">
            Eliminate the<br />Waiting Room
          </h1>
          <p className="mb-10 text-body-lg text-white/80">
            Seamless patient flow, automated scheduling, and real-time queue
            management in one intelligent platform.
          </p>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="h-10 w-10 rounded-full border-2 border-brand bg-gray-200" />
              <div className="h-10 w-10 rounded-full border-2 border-brand bg-gray-300" />
              <div className="h-10 w-10 rounded-full border-2 border-brand bg-gray-400" />
            </div>
            <p className="text-body-sm text-white/80">
              Built for modern, high-efficiency<br />healthcare facilities.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-eyebrow uppercase text-brand-accent">
          <ShieldCheck className="h-4 w-4" />
          Secure Session • Pulse Health Identity Service
        </div>
      </div>
    </aside>
  );
}