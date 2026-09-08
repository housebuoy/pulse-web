// Public system status page, reachable from the auth footer without a
// session — the same reason /support is public: someone who cannot sign in
// needs to know whether that is them or us.
//
// The data is SIMULATED (lib/mock/status.ts). The real page reads from the
// monitoring/status provider, not the Pulse backend — see the note at the
// top of that file for why there is no lib/api/status.ts to pair with it.
//
// Server component: the mock resolves on the server and the markup arrives
// rendered. No polling, no client state — a real version would either
// revalidate on an interval or move to a client fetch against the
// provider's status API.

import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleDot, Wrench } from "lucide-react";
import type { Metadata } from "next";

import { getPlatformStatus, type ServiceHealth } from "@/lib/mock/status";
import { formatJoined, formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "System Status — Pulse Health",
  description: "Live health of Pulse Health platform services.",
};

const HEALTH: Record<
  ServiceHealth,
  { label: string; dot: string; text: string; banner: string; icon: typeof CheckCircle2 }
> = {
  operational: {
    label: "Operational",
    dot: "bg-success",
    text: "text-success",
    banner: "border-success/20 bg-success/10",
    icon: CheckCircle2,
  },
  maintenance: {
    label: "Under maintenance",
    dot: "bg-brand",
    text: "text-brand",
    banner: "border-brand/20 bg-brand/10",
    icon: Wrench,
  },
  degraded: {
    label: "Degraded performance",
    dot: "bg-warning",
    text: "text-warning",
    banner: "border-warning/20 bg-warning/10",
    icon: CircleDot,
  },
  "partial-outage": {
    label: "Partial outage",
    dot: "bg-destructive",
    text: "text-destructive",
    banner: "border-destructive/20 bg-destructive/10",
    icon: CircleDot,
  },
};

const OVERALL_HEADLINE: Record<ServiceHealth, string> = {
  operational: "All systems operational",
  maintenance: "Maintenance in progress",
  degraded: "Some systems degraded",
  "partial-outage": "Partial service outage",
};

export default async function StatusPage() {
  const status = await getPlatformStatus();
  const overall = HEALTH[status.overall];
  const OverallIcon = overall.icon;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        href="/login"
        className="flex w-fit items-center gap-2 text-body-sm text-fg-muted transition-colors hover:text-fg-secondary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>

      <div className="mt-10">
        <h2 className="text-h1 text-fg">System status</h2>
        <p className="mt-3 text-body text-fg-muted">
          Live health of the services behind your Pulse workspace.
        </p>
      </div>

      {/* Overall banner */}
      <div
        className={cn(
          "mt-8 flex items-center gap-4 rounded-lg border p-5",
          overall.banner,
        )}
      >
        <span className="relative flex size-3 shrink-0">
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-60",
              overall.dot,
            )}
          />
          <span
            className={cn(
              "relative inline-flex size-3 rounded-full",
              overall.dot,
            )}
          />
        </span>
        <div className="flex-1">
          <p className={cn("text-body-lg font-medium", overall.text)}>
            {OVERALL_HEADLINE[status.overall]}
          </p>
          <p className="mt-0.5 text-caption text-fg-muted">
            Last checked {formatJoined(status.checkedAt)}
          </p>
        </div>
        <OverallIcon className={cn("size-6 shrink-0", overall.text)} />
      </div>

      {/* Uptime */}
      <div className="mt-4 flex items-baseline justify-between rounded-lg border border-border px-5 py-4">
        <span className="text-body-sm text-fg-muted">
          Uptime, last 90 days
        </span>
        <span className="text-h2 text-fg">{status.uptime90d}%</span>
      </div>

      {/* Services */}
      <div className="mt-10">
        <h3 className="text-h2 text-fg">Services</h3>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          {status.services.map((service) => {
            const health = HEALTH[service.health];
            return (
              <div
                key={service.id}
                className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body font-medium text-fg">
                    {service.name}
                  </p>
                  <p className="mt-0.5 text-caption text-fg-muted">
                    {service.description}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={cn("size-2 rounded-full", health.dot)} />
                  <span className={cn("text-body-sm font-medium", health.text)}>
                    {health.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incidents */}
      <div className="mt-10 pb-4">
        <h3 className="text-h2 text-fg">Recent incidents</h3>

        {status.incidents.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-border px-5 py-8 text-center">
            <p className="text-body text-fg-secondary">No incidents reported</p>
            <p className="mt-1 text-body-sm text-fg-muted">
              Nothing has affected the platform in the last 90 days.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {status.incidents.map((incident) => (
              <div
                key={incident.id}
                className="rounded-lg border border-border p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-body font-medium text-fg">
                    {incident.title}
                  </p>
                  <span className="shrink-0 text-caption uppercase tracking-wide text-fg-placeholder">
                    {incident.status}
                  </span>
                </div>
                <p className="mt-2 text-body-sm text-fg-muted">
                  {incident.summary}
                </p>
                <p className="mt-3 text-caption text-fg-placeholder">
                  {formatShortDate(incident.date)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="border-t border-border pt-6 text-body-sm text-fg-muted">
        Still stuck?{" "}
        <Link href="/support" className="text-brand hover:underline">
          Contact support
        </Link>
      </p>
    </div>
  );
}
