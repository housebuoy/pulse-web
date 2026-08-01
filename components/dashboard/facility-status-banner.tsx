import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { formatShortDate } from "@/lib/format";

// Persistent, dismiss-free by design — the grace period is a real deadline,
// not a notice to acknowledge and forget. Frontend display only; actual
// suspension is enforced by the backend (see FacilitySuspendedBlock for
// what that looks like once it happens).
export function FacilityStatusBanner({ dueDate }: { dueDate?: string }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-2 gap-y-1 bg-warning/10 px-4 py-2.5 text-center text-sm text-warning">
      <AlertTriangle className="size-4 shrink-0" />
      <span>
        HeFRA document required
        {dueDate ? ` — submit by ${formatShortDate(dueDate)}` : ""} or your
        workspace will be suspended.
      </span>
      <Link
        href="/d/settings?tab=facility"
        className="font-semibold underline underline-offset-2 hover:text-warning/80"
      >
        Upload now
      </Link>
    </div>
  );
}
