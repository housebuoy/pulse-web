"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearSession } from "@/lib/mock/auth";

// Full-screen takeover — replaces the sidebar and content entirely, not
// just a banner, so nothing in the workspace is reachable. Frontend
// display only: this is what the UI shows once the backend has actually
// suspended the facility (grace period expired without a HeFRA document);
// it does not itself enforce or decide the suspension.
export function FacilitySuspendedBlock() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-surface-subtle px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-danger/10">
        <ShieldAlert className="size-7 text-danger" />
      </div>
      <div className="max-w-sm space-y-2">
        <h1 className="text-h1 text-fg">Workspace suspended</h1>
        <p className="text-body text-fg-muted">
          Your facility&apos;s workspace has been suspended pending a valid
          HeFRA license document. Submit your document to restore access.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" asChild>
          <a href="mailto:support@pulsehealth.com">Contact support</a>
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            clearSession();
            window.location.href = "/login";
          }}
        >
          Sign out
        </Button>
      </div>
      <p className="text-caption text-fg-placeholder">
        Frontend display only — suspension is enforced by the backend.
      </p>
    </div>
  );
}
