"use client";

import { useState } from "react";
import { AlertTriangle, OctagonX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAccountRequest, useSubmitAccountRequest } from "@/hooks/use-settings";
import { useStaff } from "@/hooks/use-staff";
import type { AccountRequestType } from "@/lib/types/settings";

// ---- helper ----------------------------------------------------------------

function isSoleAdmin(adminId: string, staff: { role: string; id: string }[]): boolean {
  const admins = staff.filter((s) => s.role === "admin");
  return admins.length <= 1 && admins.some((s) => s.id === adminId);
}

// ---- Confirmation dialogs --------------------------------------------------

function RequestConfirmDialog({
  type,
  open,
  onOpenChange,
  isSubmitting,
  onConfirm,
}: {
  type: AccountRequestType;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isSubmitting: boolean;
  onConfirm: () => void;
}) {
  const isDelete = type === "delete";
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isDelete ? "Request account deletion" : "Deactivate account"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isDelete
              ? "Your request will be reviewed by the backend team. Under the facility data-retention policy, account data is held for 90 days before permanent removal — no data is deleted immediately."
              : "Your account will be locked pending administrator review. You can reactivate it at any time before it is processed. No data is removed."}
            {" "}This is a <strong>request</strong>, not an immediate action — the actual processing is handled by Spring Boot.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Submitting…"
              : isDelete
                ? "Submit deletion request"
                : "Submit deactivation request"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---- Main card -------------------------------------------------------------

export function DangerZoneCard() {
  const { data: staff = [] } = useStaff();
  const { data: request } = useAccountRequest();
  const submit = useSubmitAccountRequest();

  const [openFor, setOpenFor] = useState<AccountRequestType | null>(null);

  // Using a placeholder "current user" id that matches the mock admin.
  const CURRENT_USER_ID = "staff-adwoa"; // front-desk admin; adjust as needed
  const soleAdmin = isSoleAdmin(CURRENT_USER_ID, staff);

  const hasPendingRequest = request?.status === "pending";

  const handleConfirm = (type: AccountRequestType) => {
    submit.mutate({ type }, { onSuccess: () => setOpenFor(null) });
  };

  return (
    <>
      <div className="rounded-xl border border-danger/30 bg-surface p-6">
        <div className="mb-1 flex items-center gap-2 text-danger">
          <AlertTriangle className="size-4" />
          <h2 className="text-base font-bold">Danger zone</h2>
        </div>
        <p className="mb-5 text-sm text-fg-muted">
          These actions submit requests for backend processing. No data is
          deleted or altered immediately — actual enforcement and retention live
          in Spring Boot under the facility&apos;s data policy.
        </p>

        {hasPendingRequest && (
          <div className="mb-4 rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
            A <strong>{request?.type}</strong> request is pending review.
            Contact your facility administrator to cancel it.
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-start justify-between gap-3 rounded-xl border border-border p-4">
            <div>
              <p className="text-sm font-medium text-fg">Deactivate account</p>
              <p className="text-xs text-fg-muted">
                Lock sign-in; reactivatable before processing.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-warning/50 text-warning hover:bg-warning/10"
              disabled={hasPendingRequest || soleAdmin}
              onClick={() => setOpenFor("deactivate")}
            >
              Deactivate
            </Button>
          </div>

          <div className="flex flex-1 items-start justify-between gap-3 rounded-xl border border-border p-4">
            <div>
              <p className="text-sm font-medium text-fg">Request account deletion</p>
              <p className="text-xs text-fg-muted">
                Data retained 90 days under facility policy before removal.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-danger/50 text-danger hover:bg-danger/10"
              disabled={hasPendingRequest || soleAdmin}
              onClick={() => setOpenFor("delete")}
            >
              <OctagonX className="size-4" />
              Delete
            </Button>
          </div>
        </div>

        {soleAdmin && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-fg-muted">
            <AlertTriangle className="size-3.5" />
            You are the sole facility administrator. Reassign ownership in{" "}
            <a href="/d/settings?tab=team" className="text-brand underline">
              Team &amp; Access
            </a>{" "}
            before deactivating or deleting this account.
          </p>
        )}
      </div>

      {openFor && (
        <RequestConfirmDialog
          type={openFor}
          open={!!openFor}
          onOpenChange={(v) => !v && setOpenFor(null)}
          isSubmitting={submit.isPending}
          onConfirm={() => handleConfirm(openFor)}
        />
      )}
    </>
  );
}
