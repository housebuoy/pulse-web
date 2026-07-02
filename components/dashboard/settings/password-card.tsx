"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "./change-password-dialog";

export function PasswordCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-5">
        <span className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <KeyRound className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-medium text-fg">Password</span>
            <span className="block text-xs text-fg-muted">
              Change the password used to sign in
            </span>
          </span>
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
        >
          Change password
        </Button>
      </div>

      <ChangePasswordDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
