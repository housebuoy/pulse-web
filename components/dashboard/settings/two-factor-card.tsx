"use client";

import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTwoFactor, useUpdateTwoFactor } from "@/hooks/use-settings";

export function TwoFactorCard() {
  const { data: state } = useTwoFactor();
  const update = useUpdateTwoFactor();

  const enabled = state?.enabled ?? false;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <ShieldCheck className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-medium text-fg">
              Two-factor authentication
            </span>
            <span className="block text-xs text-fg-muted">
              {enabled
                ? "2FA is on — sign-in requires a second step."
                : "Add a second layer of security to your sign-in."}
              {" "}Enforcement is applied by the backend.
            </span>
          </span>
        </span>

        {/* Segmented toggle reusing the same visual style as DutyControl */}
        <div className="inline-flex items-center gap-1 rounded-md bg-surface-muted p-1">
          {(["off", "on"] as const).map((opt) => {
            const active = (opt === "on") === enabled;
            return (
              <button
                key={opt}
                type="button"
                disabled={update.isPending}
                onClick={() => update.mutate(opt === "on")}
                className={cn(
                  "rounded-sm px-3 py-1.5 text-body-sm font-medium transition-colors disabled:opacity-50",
                  active
                    ? "bg-surface text-fg shadow-input"
                    : "text-fg-muted hover:text-fg-secondary",
                )}
              >
                {opt === "on" ? "On" : "Off"}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
