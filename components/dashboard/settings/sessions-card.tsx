"use client";

import { Laptop, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatJoined } from "@/lib/format";
import {
  useSignOutAllSessions,
  useSignOutSession,
  useSessions,
} from "@/hooks/use-settings";

function deviceIcon(device: string) {
  const d = device.toLowerCase();
  if (d.includes("iphone") || d.includes("android")) return Smartphone;
  return Laptop;
}

export function SessionsCard() {
  const { data: sessions = [], isLoading } = useSessions();
  const signOut = useSignOutSession();
  const signOutAll = useSignOutAllSessions();

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-fg">Sessions &amp; devices</h2>
          <p className="text-sm text-fg-muted">
            These devices are currently signed in to your account.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={signOutAll.isPending || sessions.every((s) => s.current)}
          onClick={() =>
            signOutAll.mutate(undefined, {
              onSuccess: () => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("pulse_token");
                  window.location.href = "/onboarding/admin";
                }
              },
            })
          }
        >
          Sign out everywhere
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-muted" />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {sessions.map((session) => {
            const Icon = deviceIcon(session.device);
            return (
              <li
                key={session.id}
                className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-fg-muted">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-fg">
                      {session.device} — {session.browser}
                    </span>
                    {session.current && (
                      <StatusBadge tone="success" label="This device" />
                    )}
                  </div>
                  <p className="text-xs text-fg-muted">
                    {session.location} · Last active{" "}
                    {formatJoined(session.lastActive)}
                  </p>
                </div>
                {!session.current && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={signOut.isPending}
                    onClick={() => signOut.mutate(session.id)}
                  >
                    Sign out
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
