// components/onboarding/incomplete-setup-dialog.tsx
"use client";

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

interface IncompleteSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void; // proceed without the document
}

export function IncompleteSetupDialog({
  open,
  onOpenChange,
  onConfirm,
}: IncompleteSetupDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-lg shadow-modal">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-h2 text-fg">
            Complete setup later?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-body text-fg-muted">
            You can continue creating your workspace without uploading your HeFRA
            document right now. You will be required to upload it later in your
            dashboard to fully activate account features.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-button text-fg">
            Go back and upload
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="text-button shadow-brand">
            Save &amp; Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}